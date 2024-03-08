const HOSTNAME = 'stenciljs.com';

module.exports = {
  title: "Stencil API Docs",
  url: `https://${HOSTNAME}`,
  baseUrl: '/',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/', // Serve the docs at the site's root
        }
      }
    ]
  ],
  markdown: {
    format: 'detect',
  },
  // presets: [
  //   [
  //     '@ionic-docs/preset-classic',
  //     {}
  //   ]
  // ],
  plugins: [
    [
      'docusaurus-plugin-typedoc',

      // Plugin / TypeDoc options
      {
        entryPoints: [
          '../src/cli/index.ts',
          '../src/compiler/public.ts',
          '../src/sys/node/public.ts',
          '../src/declarations/stencil-public-runtime.ts',
          '../src/declarations/stencil-public-compiler.ts',
        ],
        excludeReferences: true,
        tsconfig: '../tsconfig.json',
        out: ".",
        readme: "api-docs-landing.md",
        // sidebar: {
        //   // categoryLabel: 'API XYZ',
        //   collapsed: false,
        //   position: 0,
        //   fullNames: true,
        // },
      },
    ],
  ],
};
