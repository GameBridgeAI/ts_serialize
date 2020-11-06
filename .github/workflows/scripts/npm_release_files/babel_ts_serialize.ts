// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import babelCore from "https://dev.jspm.io/npm:@babel/standalone";
import babelPluginProposalClassProperties from "https://dev.jspm.io/npm:@babel/plugin-proposal-class-properties";
const p = Deno.run({
  cmd: ["deno", "bundle", "./mod.ts"],
  stdout: "piped",
  stderr: "piped",
});
const { code } = await p.status();

if (code === 0) {
  const source = await p.output();
  const { transform } = babelCore as any;
  const { code } = await transform(
    new TextDecoder().decode(source),
    {
      filename: "dist/ts_serialize.js",
      presets: [
        ["env", {
          targets: {
            browsers: [
              "last 2 versions",
            ],
          },
        }],
      ],
      plugins: [babelPluginProposalClassProperties],
      babelrc: false,
      configFile: false,
    },
  );
  const encoded = new TextEncoder().encode(code);
  let written = 0;
  while (written < encoded.length) {
    written += await Deno.stdout.write(encoded.slice(written));
  }
} else {
  const rawError = await p.stderrOutput();
  const errorString = new TextDecoder().decode(rawError);
  console.log(errorString);
}
