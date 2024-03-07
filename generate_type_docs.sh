#!/bin/bash

set -euox pipefail

rm -rf ./docs

npx typedoc \
  --excludeReferences \
  src/cli/index.ts \
  src/compiler/public.ts \
  src/sys/node/public.ts \
  src/declarations/stencil-public-runtime.ts \
  src/declarations/stencil-public-compiler.ts

# markdown mode
npx typedoc \
  --plugin typedoc-plugin-markdown \
  --excludeReferences \
  src/cli/index.ts \
  src/compiler/public.ts \
  src/sys/node/public.ts \
  src/declarations/stencil-public-runtime.ts \
  src/declarations/stencil-public-compiler.ts \
  --out ../stencil-site/api

bippy --dir docs
