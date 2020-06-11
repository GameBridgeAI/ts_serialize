#!/bin/bash

# Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

# @description test build functions for package.json file from a github tag varialbes

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

mkdir "$DIR/test_tmp"

pushd "$DIR/test_tmp" > /dev/null

if [ "$( "$DIR/create_npm_package_file.sh" )" != "Error: Tag version not provided" ]; then
  popd > /dev/null

  rm -rf "$DIR/test_tmp"

  echo "Test Error: create_npm_package_file ran without a tag version"

  exit 1
fi

TEST_VERSION="test_version"

"$DIR/create_npm_package_file.sh" $TEST_VERSION

if [ ! -f "$DIR/test_tmp/package.json" ]; then
  popd > /dev/null

  rm -rf "$DIR/test_tmp"

  echo "Test Error: package.json was not created"

  exit 1
fi

if [ "$( jq -r ".version" "$DIR/test_tmp/package.json" )" != "$TEST_VERSION" ]; then
  popd > /dev/null

  rm -rf "$DIR/test_tmp"

  echo "Test Error: {package.json}.version is incorrect"
  
  exit 1
fi

popd > /dev/null

rm -rf "$DIR/test_tmp"