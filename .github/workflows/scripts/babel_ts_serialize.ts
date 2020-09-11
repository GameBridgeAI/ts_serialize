// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import babelCore from "https://dev.jspm.io/@babel/core";
import presetEnv from "https://dev.jspm.io/@babel/preset-env";

const [, source] = await Deno.bundle("./mod.ts");
const { code } = babelCore.transformSync(source, {
  filename: "dist/index.js",
  presets: [presetEnv],
  babelrc: false,
  configFile: false,
});
const encoded = new TextEncoder().encode(code);
let written = await Deno.stdout.write(encoded);
while (written !== encoded.length) {
  written += await Deno.stdout.write(encoded.slice(written));
}
