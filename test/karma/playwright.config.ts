import { expect } from '@playwright/test';

import { createStencilPlaywrightConfig } from './test-app/utils/test/playwright/create-config';
import { matchers } from './test-app/utils/test/playwright/matchers';

expect.extend(matchers);

// TODO: idk if it's valid to export an async result, Playwright seems to handle this so far
export default createStencilPlaywrightConfig();
