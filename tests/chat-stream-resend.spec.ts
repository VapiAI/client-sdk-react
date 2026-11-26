import { test, expect, Page } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';

// Runs the built chat widget against a local mock of POST /chat/web that
// streams a 20-word reply, one SSE chunk every 120 ms. No Vapi API calls.

const WORDS = Array.from(
  { length: 20 },
  (_, i) => `w${String(i + 1).padStart(2, '0')}`
);

type StreamRequest = { body: string; chunksSent: number; completed: boolean };

async function startMockServer(options: { dropFirstAfter?: number } = {}) {
  const requests: StreamRequest[] = [];
  let sessionsCreated = 0;
  const bundle = fs.readFileSync(
    path.resolve(process.cwd(), 'dist/embed/widget.umd.js')
  );

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/widget.umd.js') {
      res.writeHead(200, { 'content-type': 'application/javascript' });
      res.end(bundle);
      return;
    }

    if (req.method === 'GET' && req.url === '/') {
      const { port } = server.address() as AddressInfo;
      const props = {
        publicKey: 'test-public-key',
        assistantId: 'test-assistant-id',
        mode: 'chat',
        apiUrl: `http://127.0.0.1:${port}`,
        ctaTitle: 'Open chat',
        chatPlaceholder: 'Ask me',
      };
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(
        `<!doctype html><html><body>
          <div id="widget" data-client-widget="VapiWidget" data-props='${JSON.stringify(props)}'></div>
          <script src="/widget.umd.js"></script>
        </body></html>`
      );
      return;
    }

    if (req.method === 'POST' && req.url === '/chat/web') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const parsed = JSON.parse(body);
        if (!parsed.sessionId) sessionsCreated++;
        const sessionId = parsed.sessionId ?? randomUUID();
        const request: StreamRequest = {
          body,
          chunksSent: 0,
          completed: false,
        };
        requests.push(request);
        const isFirst = requests.length === 1;

        res.writeHead(200, { 'content-type': 'text/event-stream' });
        const timer = setInterval(() => {
          if (
            isFirst &&
            options.dropFirstAfter !== undefined &&
            request.chunksSent === options.dropFirstAfter
          ) {
            clearInterval(timer);
            res.socket?.destroy();
            return;
          }
          if (request.chunksSent < WORDS.length) {
            const delta = `${WORDS[request.chunksSent]} `;
            res.write(
              `data: ${JSON.stringify({ sessionId, path: 'chat.output[0].content', delta })}\n\n`
            );
            request.chunksSent++;
            return;
          }
          clearInterval(timer);
          request.completed = true;
          res.end('data: [DONE]\n\n');
        }, 120);
        res.on('close', () => clearInterval(timer));
      });
      return;
    }

    res.writeHead(404).end();
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/`,
    requests,
    sessionsCreated: () => sessionsCreated,
    close: () => server.close(),
  };
}

// Fires the same signal @microsoft/fetch-event-source listens for.
async function setPageHidden(page: Page, hidden: boolean) {
  await page.evaluate((isHidden) => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => isHidden,
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (isHidden ? 'hidden' : 'visible'),
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

async function sendMessage(page: Page, url: string) {
  await page.goto(url);
  await page.getByText('Open chat').click();
  const input = page.getByPlaceholder('Ask me');
  await input.fill('hello');
  await input.press('Enter');
}

const timesFirstWordShown = (page: Page) =>
  page
    .locator('#widget')
    .evaluate(
      (el) => ((el as HTMLElement).innerText.match(/w01/g) || []).length
    );

test.describe('Chat streaming re-sends', () => {
  test('hiding the page mid-stream does not cancel and re-send the message', async ({
    page,
  }) => {
    const mock = await startMockServer();
    try {
      await sendMessage(page, mock.url);
      await expect
        .poll(() => mock.requests[0]?.chunksSent ?? 0)
        .toBeGreaterThanOrEqual(3);

      await setPageHidden(page, true);
      await page.waitForTimeout(1500);
      await setPageHidden(page, false);

      await expect
        .poll(() => mock.requests.some((r) => r.completed), { timeout: 10_000 })
        .toBe(true);
      await page.waitForTimeout(500);

      expect.soft(mock.requests.length, 'POST /chat/web count').toBe(1);
      expect
        .soft(mock.requests[0].completed, 'first stream completed')
        .toBe(true);
      expect.soft(mock.sessionsCreated(), 'sessions created').toBe(1);
      expect
        .soft(await timesFirstWordShown(page), 'reply rendered once')
        .toBe(1);
    } finally {
      mock.close();
    }
  });

  test('a connection drop mid-stream does not re-send the message', async ({
    page,
  }) => {
    const mock = await startMockServer({ dropFirstAfter: 3 });
    const streamErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().startsWith('Stream error:')) {
        streamErrors.push(msg.text());
      }
    });
    try {
      await sendMessage(page, mock.url);
      await expect.poll(() => mock.requests[0]?.chunksSent ?? 0).toBe(3);
      // fetch-event-source retries after 1000 ms by default
      await page.waitForTimeout(3000);

      expect.soft(mock.requests.length, 'POST /chat/web count').toBe(1);
      expect
        .soft(await timesFirstWordShown(page), 'partial reply not repeated')
        .toBe(1);
      expect.soft(streamErrors.length, 'error passed to onError once').toBe(1);
    } finally {
      mock.close();
    }
  });
});
