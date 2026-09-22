import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * The `labels` prop: every UI string the widget renders on its own — the
 * header status line, button labels and tooltips — can be overridden, through
 * React props, the <vapi-widget> `labels` JSON attribute and the `data-labels`
 * JSON attribute of the data-attribute embed. Keys that are left out keep
 * their English default.
 */

async function openWidget(page: Page, containerId: string): Promise<Locator> {
  await page.goto('/test-widget-labels');
  await page.waitForFunction(() => (window as any).WidgetLoader !== undefined, {
    timeout: 5000,
  });
  const container = page.locator(`#${containerId}`);
  // The floating button shows the widget title.
  await container.getByText('Chat', { exact: true }).click();
  return container;
}

test.describe('VapiWidget labels', () => {
  for (const containerId of ['labels-widget-1', 'labels-widget-2']) {
    test(`${containerId}: consent buttons, status line and header controls use the given labels`, async ({
      page,
    }) => {
      const container = await openWidget(page, containerId);

      // Consent form buttons come from `labels`
      await expect(
        container.getByRole('button', { name: 'Abbrechen' })
      ).toBeVisible();
      await container.getByRole('button', { name: 'Akzeptieren' }).click();

      // Header: overridden status line and End Chat button
      await expect(container.getByText('Nachricht eingeben')).toBeVisible();
      await expect(
        container.getByRole('button', { name: 'Beenden' })
      ).toBeVisible();

      // Keys that were not overridden keep their English default: the reset
      // tooltip is overridden only on the first widget, the send tooltip on
      // neither.
      const resetTitle =
        containerId === 'labels-widget-1'
          ? 'Zurücksetzen'
          : 'Reset conversation';
      await expect(container.getByTitle(resetTitle)).toBeVisible();
      await expect(container.getByTitle('Send message')).toBeVisible();
    });
  }

  test('without labels, the English defaults are unchanged', async ({
    page,
  }) => {
    await page.goto('/test-widget-embed');
    await page.waitForFunction(
      () => (window as any).WidgetLoader !== undefined,
      { timeout: 5000 }
    );

    // The custom element on that page runs in hybrid mode with consent
    // required, a `chat-first-message` (so the conversation counts as
    // started) and no `labels`.
    const widget = page.locator('vapi-widget');
    await widget.getByText('CTA Title', { exact: true }).click();
    await expect(widget.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await widget.getByRole('button', { name: 'Accept' }).click();
    await expect(widget.getByText('Ready to assist')).toBeVisible();
    await expect(widget.getByTitle('Reset conversation')).toBeVisible();
    await expect(widget.getByTitle('Send message')).toBeVisible();
  });
});
