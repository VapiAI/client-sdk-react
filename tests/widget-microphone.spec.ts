import { test, expect, type Page } from '@playwright/test';

// The embed bundles @vapi-ai/web, which asks for the microphone before it
// creates the call. Until the user allows it, no call may exist: the server
// would end one as assistant-did-not-receive-customer-audio.

// Full Chromium, because the headless shell rejects every getUserMedia call
// with NotSupportedError, so the allowed case could not pass there.
test.use({
  channel: 'chromium',
  launchOptions: { args: ['--use-fake-device-for-media-stream'] },
});

const WIDGET_PAGE = `<!DOCTYPE html>
<html>
  <body>
    <vapi-widget
      public-key="pk_test"
      assistant-id="asst_test"
      api-url="http://localhost:4200/stub-api"
      mode="voice"
      cta-title="Open test widget"
      start-button-text="Start test call"
    ></vapi-widget>
    <script src="/dist/embed/widget.umd.js"></script>
  </body>
</html>`;

const START_BUTTON = { name: 'Start test call' };

/** Opens the widget, clicks start, and returns a live count of POST /call/web. */
async function widgetCallStart(page: Page): Promise<() => number> {
  let webCallRequests = 0;
  await page.route('**/stub-api/call/web', async (route) => {
    webCallRequests++;
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'stub: no real call' }),
    });
  });
  await page.route('**/mic-test', (route) =>
    route.fulfill({ contentType: 'text/html', body: WIDGET_PAGE })
  );

  await page.goto('/mic-test');
  // The collapsed launcher is a clickable div, not a button; its label is
  // set by this page, so the text is stable.
  await page.getByText('Open test widget').click();
  await page.getByRole('button', START_BUTTON).click();
  return () => webCallRequests;
}

test.describe('VapiWidget microphone preflight', () => {
  test('creates no call when the microphone is blocked', async ({ page }) => {
    // Playwright can only grant permissions; denying needs the DevTools protocol.
    // Without the context id it applies to the default context, not this test's.
    const cdp = await page.context().newCDPSession(page);
    const { targetInfo } = await cdp.send('Target.getTargetInfo');
    await cdp.send('Browser.setPermission', {
      permission: { name: 'microphone' },
      setting: 'denied',
      origin: 'http://localhost:4200',
      browserContextId: targetInfo.browserContextId,
    });

    const webCallRequests = await widgetCallStart(page);

    // The widget returns to its start state once start() fails.
    await expect(page.getByRole('button', START_BUTTON)).toBeEnabled();
    expect(webCallRequests()).toBe(0);
  });

  test('creates no call while the permission prompt is unanswered', async ({
    page,
  }) => {
    // A click is a user gesture, so Chromium shows the prompt and waits.
    const webCallRequests = await widgetCallStart(page);

    await expect(
      page.getByRole('button', { name: 'Connecting...' })
    ).toBeVisible();
    await page.waitForTimeout(2000);
    expect(webCallRequests()).toBe(0);
  });

  test('creates the call when the microphone is allowed', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['microphone']);

    const webCallRequests = await widgetCallStart(page);

    await expect.poll(webCallRequests).toBe(1);
  });
});
