#!/bin/bash

# Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

if [ -z "$1" ]; then
    echo "Error: Tag version not provided";
    exit 1
fi

.github/workflows/scripts/npm_release_files/create_npm_package_file_test.sh

curl -L https://deno.land/x/install/install.sh | sh -s "v1.5.2"

export PATH="$HOME/.deno/bin:$PATH"

mkdir dist

deno run -r --allow-read --allow-run ./.github/workflows/scripts/npm_release_files/babel_ts_serialize.ts > dist/ts_serialize.js

cp .github/workflows/scripts/npm_release_files/ts_serialize.d.ts dist

cp CHANGELOG.md dist

cp README.md dist

cp LICENSE dist

cd dist

../.github/workflows/scripts/npm_release_files/create_npm_package_file.sh "$1"

# Test current built deployment on node example
cd ../examples/node

npm ci
npm ln ../../dist

npm test