import { expect } from '@playwright/test';

// import { createStencilPlaywrightConfig } from './test-app/utils/test/playwright/create-config';
import { matchers } from './test-app/utils/test/playwright/matchers';

expect.extend(matchers);

// TODO: idk if it's valid to export an async result, Playwright seems to handle this so far
// export default createStencilPlaywrightConfig();
export default {
  testMatch: '*.e2e.ts',
  use: {
    baseURL: 'http://localhost:3333',
  },
  webServer: {
    // TODO: this could be something projects want to override often
    command: 'npm start -- --no-open',
    url: 'http://localhost:3333/ping',
    reuseExistingServer: !process.env.CI,
    // TODO: another field users might want to configure.
    // Max time to wait for dev server to start before aborting, defaults to 60000 (60 seconds)
    // timeout: 1000,
  },
};
