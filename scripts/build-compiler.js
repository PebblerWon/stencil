const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommonjs = require('rollup-plugin-commonjs');
const transpile = require('./transpile');


const DIST_DIR = path.join(__dirname, '..', 'dist');
const TRANSPILED_DIR = path.join(DIST_DIR, 'transpiled-compiler');
const ENTRY_FILE = path.join(TRANSPILED_DIR, 'compiler', 'index.js');
const COMPILER_DIST_DIR = path.join(DIST_DIR, 'compiler');
const COMPILER_DIST_FILE = path.join(COMPILER_DIST_DIR, 'index.js');
const UTILS_DIST_DIR = path.join(DIST_DIR, 'utils');
const DECLARATIONS_SRC_DIR = path.join(TRANSPILED_DIR, 'declarations');
const DECLARATIONS_DST_DIR = path.join(DIST_DIR, 'declarations');

let buildId = process.argv.find(a => a.startsWith('--build-id=')) || '';
buildId = buildId.replace('--build-id=', '');


const success = transpile(path.join('..', 'src', 'compiler', 'tsconfig.json'));

if (success) {

  async function bundleCompiler() {
    const build = await rollup.rollup({
      input: ENTRY_FILE,
      external: [
        'crypto',
        'fs',
        'path',
        'typescript',
        '../mock-doc/index.js',
        '../renderer/vdom/index.js',
        '../util/index.js'
      ],
      plugins: [
        (() => {
          return {
            resolveId(id) {
              if (id === '@stencil/core/build-conditionals') {
                return path.join(TRANSPILED_DIR, 'compiler', 'app-core', 'build-conditionals.js');
              }
              if (id === '@stencil/core/mock-doc') {
                return '../mock-doc/index.js';
              }
              if (id === '@stencil/core/renderer/vdom') {
                return '../renderer/vdom/index.js';
              }
              if (id === '@stencil/core/utils') {
                return '../util/index.js';
              }
            }
          }
        })(),
        rollupResolve({
          preferBuiltins: true
        }),
        rollupCommonjs()
      ],
      onwarn: (message) => {
        if (/top level of an ES module/.test(message)) return;
        console.error(message);
      }
    });

    // copy over all the .d.ts file too
    fs.copySync(path.dirname(ENTRY_FILE), COMPILER_DIST_DIR, {
      filter: (src) => {
        return src.indexOf('.js') === -1 && src.indexOf('.spec.') === -1;
      }
    });

    fs.copySync(DECLARATIONS_SRC_DIR, DECLARATIONS_DST_DIR, {
      filter: (src) => {
        return src.indexOf('.js') === -1 && src.indexOf('.spec.') === -1;
      }
    });

    const results = await build.generate({
      format: 'cjs',
      file: COMPILER_DIST_FILE
    });

    const outputText = updateBuildIds(buildId, results.code);

    fs.ensureDirSync(path.dirname(COMPILER_DIST_FILE));
    fs.writeFileSync(COMPILER_DIST_FILE, outputText);
  }

  async function buildUtils() {
    const build = await rollup.rollup({
      input: path.join(TRANSPILED_DIR, 'utils', 'index.js'),
      external: [
        'buffer',
        'crypto',
        'module',
        'path',
        'fs',
        'os',
        'typescript'
      ],
      plugins: [
        rollupResolve({
          preferBuiltins: true
        }),
        rollupCommonjs()
      ],
      onwarn: (message) => {
        if (/top level of an ES module/.test(message)) return;
        console.error(message);
      }
    });

    build.write({
      format: 'es',
      file: path.join(UTILS_DIST_DIR, 'index.mjs')
    });

    build.write({
      format: 'cjs',
      file: path.join(UTILS_DIST_DIR, 'index.js')
    });
  }

  buildUtils();

  bundleCompiler();

  process.on('exit', () => {
    fs.removeSync(TRANSPILED_DIR);
    console.log(`✅  compiler`);
  });

} else {
  console.log(`❌  compiler`);
}


function updateBuildIds(buildId, input) {
  // __BUILDID__
  // __BUILDID:TRANSPILE__
  // __BUILDID:OPTIMIZECSS__
  // __BUILDID:MINIFYJS__

  let output = input;

  // increment this number to bust the cache entirely
  const CACHE_BUSTER = 2;

  output = output.replace(/__BUILDID__/g, buildId);

  let transpilePkg = require('../node_modules/typescript/package.json');
  let transpileId = transpilePkg.name + transpilePkg.version + CACHE_BUSTER;
  output = output.replace(/__BUILDID:TRANSPILE__/g, transpileId);

  let minifyJsPkg = require('../node_modules/terser/package.json');
  let minifyJsId = minifyJsPkg.name + minifyJsPkg.version + CACHE_BUSTER;
  output = output.replace(/__BUILDID:MINIFYJS__/g, minifyJsId);

  let autoprefixerPkg = require('../node_modules/autoprefixer/package.json');
  let cssnanoPkg = require('../node_modules/cssnano/package.json');
  let postcssPkg = require('../node_modules/postcss/package.json');
  let id = autoprefixerPkg.name + autoprefixerPkg.version + '_' + cssnanoPkg.name + cssnanoPkg.version + '_' + postcssPkg.name + postcssPkg.version + '_' + CACHE_BUSTER;
  output = output.replace(/__BUILDID:OPTIMIZECSS__/g, id);

  return output;
}
