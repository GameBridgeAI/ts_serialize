#!/bin/bash

# Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

# Bash strict mode
set -euo pipefail

if [ -z "$1" ]; then
    echo "Error: Tag version not provided";
    exit 1
fi

.github/workflows/scripts/npm_release_files/create_npm_package_file_test.sh

mkdir dist

deno run -r --unstable --allow-read --allow-run --no-check ./.github/workflows/scripts/npm_release_files/babel_ts_serialize.ts > dist/ts_serialize.js

cp .github/workflows/scripts/npm_release_files/ts_serialize.d.ts dist

cp CHANGELOG.md dist

cp README.md dist

cp LICENSE dist

cd dist

../.github/workflows/scripts/npm_release_files/create_npm_package_file.sh "$1"

# Test current built deployment on node example
cd ../node_tests

npm i

npm ln ../dist

npm test
