import * as ReleaseTasks from '../release-tasks';
import * as Options from '../utils/options';
import { stubPackageData } from './PackageData.stub';

describe('release()', () => {
  let consoleLogSpy: jest.SpyInstance<
    ReturnType<typeof globalThis.console.log>,
    Parameters<typeof globalThis.console.log>
  >;
  let getOptionsSpy: jest.SpyInstance<ReturnType<typeof Options.getOptions>, Parameters<typeof Options.getOptions>>;
  let runReleaseTasksSpy: jest.SpyInstance<
    ReturnType<typeof ReleaseTasks.runReleaseTasks>,
    Parameters<typeof ReleaseTasks.runReleaseTasks>
  >;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(globalThis.console, 'log');
    consoleLogSpy.mockReturnValue();

    getOptionsSpy = jest.spyOn(Options, 'getOptions');
    getOptionsSpy.mockReturnValue({
      packageJson: stubPackageData(),
    });

    runReleaseTasksSpy = jest.spyOn(ReleaseTasks, 'runReleaseTasks');
    runReleaseTasksSpy.mockResolvedValue();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    getOptionsSpy.mockRestore();
    runReleaseTasksSpy.mockRestore();
  });
});
