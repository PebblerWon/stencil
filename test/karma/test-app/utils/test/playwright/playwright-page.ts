import type {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from '@playwright/test';
import { test as base } from '@playwright/test';

import { initPageEvents } from './page/event-spy';
import type { LocatorOptions } from './page/utils';
import { goto as goToPage, locator, setContent, spyOnEvent, waitForChanges } from './page/utils';
import type { BrowserNameOrCallback, E2EPage, E2EPageOptions, E2ESkip } from './playwright-declarations';

type CustomTestArgs = PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions & {
    page: E2EPage;
  };

type CustomFixtures = {
  page: E2EPage;
  skip: E2ESkip;
};

/**
 * Extends the base `page` test figure within Playwright.
 * @param page The page to extend.
 * @returns The modified playwright page with extended functionality.
 */
export async function extendPageFixture(page: E2EPage) {
  const originalGoto = page.goto.bind(page);
  const originalLocator = page.locator.bind(page);

  await page.addInitScript(() => {
    window.addEventListener('appload', () => {
      (window as any).testAppLoaded = true;
    });
  });

  // Overridden Playwright methods
  page.goto = (url: string, options?: E2EPageOptions) => goToPage(page, url, originalGoto, options);
  page.setContent = (html: string, options?: E2EPageOptions) => setContent(page, html, test.info(), options);
  page.locator = (selector: string, options?: LocatorOptions) => locator(page, originalLocator, selector, options);

  // Custom adapter methods
  page.waitForChanges = (timeoutMs?: number) => waitForChanges(page, timeoutMs);
  page.spyOnEvent = (eventName: string) => spyOnEvent(page, eventName);

  // Custom event behavior
  await initPageEvents(page);

  return page;
}

export const test = base.extend<CustomFixtures>({
  page: async ({ page }: CustomTestArgs, use: (r: E2EPage) => Promise<void>) => {
    page = await extendPageFixture(page);
    await use(page);
  },
  skip: {
    browser: (
      browserNameOrFunction: BrowserNameOrCallback,
      reason = `The functionality that is being tested is not applicable to this browser.`,
    ) => {
      const browserName = base.info().project.use.browserName!;

      if (typeof browserNameOrFunction === 'function') {
        base.skip(browserNameOrFunction(browserName), reason);
      } else {
        base.skip(browserName === browserNameOrFunction, reason);
      }
    },
    mode: (mode: string, reason = `The functionality that is being tested is not applicable to ${mode} mode`) => {
      base.skip(base.info().project.metadata.mode === mode, reason);
    },
  },
});
