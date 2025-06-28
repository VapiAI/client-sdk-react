import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    WidgetLoader: any;
  }
}

test.describe('VapiWidget Embed Tests', () => {
  test('should load widget from script tag with data attributes', async ({
    page,
  }) => {
    await page.goto('/test-widget-embed');

    // Wait for the widget script to load
    await page.waitForFunction(
      () => (window as any).WidgetLoader !== undefined,
      { timeout: 5000 }
    );

    // Check if widget container exists
    const widget1 = await page.locator('#vapi-widget-1');
    await expect(widget1).toBeAttached();

    // Check if the widget has been initialized (should have shadow root or child elements)
    await page.waitForFunction(
      (selector) => {
        const element = document.querySelector(selector);
        return element && (element.shadowRoot || element.children.length > 0);
      },
      '#vapi-widget-1',
      { timeout: 3000 }
    );

    // Verify the widget has created some content (React root or shadow DOM)
    const widgetInitialized = await page.evaluate(() => {
      const widget = document.querySelector('#vapi-widget-1');
      if (!widget) return false;
      // Check for React root or any child elements
      return (
        widget.children.length > 0 ||
        widget.shadowRoot !== null ||
        widget.innerHTML !== ''
      );
    });
    expect(widgetInitialized).toBe(true);
  });

  test('should load widget from script tag with data-props JSON', async ({
    page,
  }) => {
    await page.goto('/test-widget-embed');

    // Wait for the widget script to load
    await page.waitForFunction(
      () => (window as any).WidgetLoader !== undefined,
      { timeout: 5000 }
    );

    // Check if widget container exists
    const widget2 = await page.locator('#vapi-widget-2');
    await expect(widget2).toBeAttached();

    // Wait for widget initialization
    await page.waitForFunction(
      (selector) => {
        const element = document.querySelector(selector);
        return element && (element.shadowRoot || element.children.length > 0);
      },
      '#vapi-widget-2',
      { timeout: 3000 }
    );

    // Verify the widget has been initialized
    const widgetInitialized = await page.evaluate(() => {
      const widget = document.querySelector('#vapi-widget-2');
      if (!widget) return false;
      return (
        widget.children.length > 0 ||
        widget.shadowRoot !== null ||
        widget.innerHTML !== ''
      );
    });
    expect(widgetInitialized).toBe(true);
  });

  test('should expose WidgetLoader globally', async ({ page }) => {
    await page.goto('/test-widget-embed');

    // Wait for WidgetLoader to be available
    await page.waitForFunction(
      () => typeof (window as any).WidgetLoader === 'function',
      { timeout: 5000 }
    );

    // Verify WidgetLoader is a function
    const hasWidgetLoader = await page.evaluate(() => {
      return typeof (window as any).WidgetLoader === 'function';
    });
    expect(hasWidgetLoader).toBe(true);
  });

  test('widget builds successfully and creates necessary files', async ({
    page,
  }) => {
    // Navigate to check if built files are accessible
    const styleResponse = await page.goto('/dist/embed/style.css');
    expect(styleResponse?.status()).toBe(200);

    const scriptResponse = await page.goto('/dist/embed/widget.umd.js');
    expect(scriptResponse?.status()).toBe(200);
  });
});
