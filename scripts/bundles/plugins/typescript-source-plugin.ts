import fs from 'fs-extra';
import { join } from 'path';
import type { Plugin } from 'rollup';

import type { BuildOptions } from '../../utils/options';

/**
 * Creates a rollup plugin to embed an optimized version of the TypeScript compiler into the Stencil compiler.
 * @param opts the options being used during a build of the Stencil compiler
 * @returns the plugin that adds a modified version of the TypeScript compiler into the generated output
 */
export function typescriptSourcePlugin(opts: BuildOptions): Plugin {
  const tsPath = require.resolve('typescript');
  return {
    name: 'typescriptSourcePlugin',
    /**
     * A rollup build hook for resolving TypeScript relative to this project
     * [Source](https://rollupjs.org/guide/en/#resolveid)
     * @param id the importee exactly as it is written in an import statement in the source code
     * @returns an object that resolves an import to a different id
     */
    resolveId(id: string): string | null {
      if (id === 'typescript') {
        return tsPath;
      }
      return null;
    },
    /**
     * A rollup build hook for loading the TypeScript compiler. [Source](https://rollupjs.org/guide/en/#load)
     * @param id the path of the module to load
     * @returns the TypeScript compiler source
     */
    load(id: string): Promise<string> | null {
      if (id === tsPath) {
        return bundleTypeScriptSource(tsPath, opts);
      }
      return null;
    },
  };
}

/**
 * Bundles the TypeScript compiler in the Stencil output. This function also performs several optimizations and
 * modifications to the TypeScript source.
 * @param tsPath a path to the TypeScript compiler
 * @param opts the options being used during a build of the Stencil compiler
 * @returns the modified TypeScript source
 */
async function bundleTypeScriptSource(tsPath: string, opts: BuildOptions): Promise<string> {
  const fileName = `typescript-${opts.typescriptVersion.replace(/\./g, '_')}-bundle-cache${
    opts.isProd ? '.min' : ''
  }.js`;
  const cacheFile = join(opts.scriptsBuildDir, fileName);

  // TMP never hit cache
  // try {
  //   // check if we've already cached this bundle
  //   return await fs.readFile(cacheFile, 'utf8');
  // } catch (e) {}

  // get the source typescript.js file to modify
  let code = await fs.readFile(tsPath, 'utf8');

  // remove the default ts.getDefaultLibFilePath because it uses some
  // node apis and we'll be replacing it with our own anyways
  code = removeFromSource(code, `getDefaultLibFilePath: () => getDefaultLibFilePath,`);

  // remove the CPUProfiler since it uses node apis
  code = removeFromSource(code, `enableCPUProfiler,`);
  code = removeFromSource(code, `disableCPUProfiler,`);

  // this is the bit where we transmute a commonjs module into an ES module
  // don't ask why, just go with it 🙃

  // trim off the last part that sets module.exports and polyfills globalThis since
  // we don't want typescript to add itself to module.exports when in a node env
  const tsEnding = `if (typeof module !== "undefined" && module.exports) { module.exports = ts; }`;

  if (!code.includes(tsEnding)) {
    throw new Error(`"${tsEnding}" not found`);
  }
  const lastEnding = code.lastIndexOf(tsEnding);
  code = code.slice(0, lastEnding);

  const o: string[] = [];
  o.push(`// TypeScript ${opts.typescriptVersion}`);
  o.push(`import { IS_NODE_ENV } from '@environment';`);
  o.push(`process.browser = !IS_NODE_ENV;`);
  o.push(code);
  o.push(`export default ts;`);
  code = o.join('\n');

  await fs.writeFile(cacheFile, code);

  return code;
}

/**
 * Removes a specific section from the provided source code via commenting the offending code out
 * @param srcCode the source code to modify
 * @param removeCode the code to remove from the source
 * @returns the updated source code
 */
function removeFromSource(srcCode: string, removeCode: string): string {
  if (!srcCode.includes(removeCode)) {
    throw new Error(`"${removeCode}" not found`);
  }
  return srcCode.replace(removeCode, `/* commented out: ${removeCode} */`);
}
