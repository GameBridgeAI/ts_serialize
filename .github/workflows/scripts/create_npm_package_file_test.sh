#!/bin/bash

# @description test build functions for package.json file from a github tag varialbes
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# echo $DIR;exit
mkdir "$DIR/test_tmp"
pushd "$DIR/test_tmp" > /dev/null
if [ ! "$DIR/create_npm_package_file.sh" ]; then
  echo "Test Error: create_npm_package_file ran without a tag version"
  exit 1
fi

test_version="test_version"
"$DIR/create_npm_package_file.sh" $test_version

if [ ! -f "$DIR/test_tmp/package.json" ]; then
  echo "Test Error: package.json was not created"
  exit 1
fi

if [ "$(jq -r ".version" "$DIR/test_tmp/package.json")" != "$test_version" ]; then
  echo "Test Error: {package.json}.version is incorrect"
  exit 1
fi

popd > /dev/null
rm -rf "$DIR/test_tmp"