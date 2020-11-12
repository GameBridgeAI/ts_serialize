#!/bin/bash

# Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

# @description builds a package.json file from github tag varialbes

if [ -z "$1" ]; then
    echo "Error: Tag version not provided";
    exit 1
fi

cat <<EOF >> "package.json" 
{
  "name": "@gamebridgeai/ts_serialize",
  "version": "$1",
  "description": "A zero dependency library for serializing data.",
  "main": "ts_serialize.js",
  "types": "ts_serialize.d.ts",
  "repository": {
    "type": "git",
    "url": "https://github.com/GameBridgeAI/ts_serialize.git"
  },
  "author": "GameBridgeAI",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/GameBridgeAI/ts_serialize/issues"
  },
  "homepage": "https://gamebridgeai.github.io/ts_serialize",
  "keywords": [
        "typescript",
        "serialize",
        "serialization",
        "JSON",
        "node",
        "deno",
        "ts_serialize",
        "ts-serialize"
    ]
}
EOF
    