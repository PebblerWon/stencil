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

bippy --dir docs
