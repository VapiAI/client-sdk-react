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

  test('should load widget from vapi-widget custom element', async ({
    page,
  }) => {
    await page.goto('/test-widget-embed');

    // Wait for the widget script to load
    await page.waitForFunction(
      () => (window as any).WidgetLoader !== undefined,
      { timeout: 5000 }
    );

    // Check if custom element exists
    const customWidget = await page.locator('vapi-widget');
    await expect(customWidget).toBeAttached();

    // Wait for widget initialization
    await page.waitForFunction(
      () => {
        const element = document.querySelector('vapi-widget');
        return element && (element.shadowRoot || element.children.length > 0);
      },
      { timeout: 3000 }
    );

    // Verify the custom element has been initialized
    const widgetInitialized = await page.evaluate(() => {
      const widget = document.querySelector('vapi-widget');
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

  test('widget builds successfully with CSS inlined in JavaScript', async ({
    page,
  }) => {
    // Simply verify that the widget JavaScript file is accessible
    const response = await page.request.get('/dist/embed/widget.umd.js');
    expect(response.status()).toBe(200);

    // Verify it's a substantial file (CSS is inlined)
    const scriptContent = await response.text();
    expect(scriptContent.length).toBeGreaterThan(500000); // Should be large with inlined CSS
  });

  test('should automatically inject CSS styles when widget loads', async ({
    page,
  }) => {
    await page.goto('/test-widget-embed');

    // Wait for the widget script to load
    await page.waitForFunction(
      () => (window as any).WidgetLoader !== undefined,
      { timeout: 5000 }
    );

    // Check if any style elements exist (CSS should be injected)
    const hasStyleElements = await page.evaluate(() => {
      return document.querySelectorAll('style').length > 0;
    });

    expect(hasStyleElements).toBe(true);
  });
});
