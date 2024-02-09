import { expect, PlaywrightTestConfig } from '@playwright/test';

import { matchers } from './test-app/utils/test/playwright/matchers';

expect.extend(matchers);

const config: PlaywrightTestConfig = {
  testMatch: '*.e2e.ts',
  use: {
    baseURL: 'http://localhost:3333',
  },
  webServer: {
    command: 'npm start -- --no-open',
    url: 'http://localhost:3333/ping',
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
