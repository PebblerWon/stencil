import { expect } from '@playwright/test';
import { test } from '@utils/test/playwright';

test.describe('attribute-basic-playwright', () => {
  test('button click rerenders', async ({ page }) => {
    await page.goto('/test-www/attribute-basic-playwright');
    // await page.setContent('<attribute-basic-root></attribute-basic-root>');

    expect(await page.locator('.single').textContent()).toBe('single');
    expect(await page.locator('.multiWord').textContent()).toBe('multiWord');
    expect(await page.locator('.customAttr').textContent()).toBe('my-custom-attr');
    expect(await page.locator('.htmlForLabel').getAttribute('for')).toBe('a');

    const button = page.locator('button');
    await button.click();

    await page.waitForChanges();

    expect(await page.locator('.single').textContent()).toBe('single-update');
    expect(await page.locator('.multiWord').textContent()).toBe('multiWord-update');
    expect(await page.locator('.customAttr').textContent()).toBe('my-custom-attr-update');
  });
});
