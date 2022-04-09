#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-run=npm,cmd

// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { build, emptyDir } from "https://deno.land/x/dnt@0.22.0/mod.ts";
import { parse } from "https://deno.land/std@0.133.0/flags/mod.ts";

const entryPointDefault = "./mod.ts";
const outDirDefault = "./dist";

const helpText =
  "Deno to node transpiler, converts the ts_serialize module to a node compatible module, and writes it to .github/workflows/npm, or the directory of your choice." +
  "\n" +
  "\nThis must be run from the project root if using the default arguments." +
  "\n" +
  "\nUsage:" +
  `\n\t./_build_npm.ts -v "v0.0.0-test" [-e ${entryPointDefault}] [-o ${outDirDefault}]` +
  "\n\t./_build_npm.ts --help" +
  "\n" +
  "\nCommand line arguments:" +
  "\n\t-h,  --help               Prints this help message, then exits." +
  "\n\t-v,  --version=[version]  The version value to set in the resulting package.json. Required." +
  `\n\t-e,  --entry-point=[path] The path to the mod.ts file to transpile into the npm package. Defaults to "${entryPointDefault}"` +
  `\n\t-o,  --out=[path]         The path to the target directory where the built files should be placed. Defaults to "${outDirDefault}"`;

function printHelpText() {
  console.log(helpText);
}

const flags = parse(Deno.args);

if (flags.h || flags.help) {
  printHelpText();
  Deno.exit();
}

const version = flags.v || flags.version;
const entryPoint = flags.e || flags["entry-point"] || entryPointDefault;
const outDir = flags.o || flags.out || outDirDefault;

if (!version) {
  console.log("A version (-v or --version) is required");
  printHelpText();
  Deno.exit(1);
}
try {
  await emptyDir(outDir);

  await build({
    entryPoints: [entryPoint],
    outDir,
    compilerOptions: { target: "ES2021" },
    shims: {
      deno: true,
    },
    package: {
      name: "@gamebridgeai/ts_serialize",
      version,
      description: "A zero dependency library for serializing data.",
      repository: {
        type: "git",
        url: "https://github.com/GameBridgeAI/ts_serialize.git",
      },
      author: "GameBridgeAI",
      license: "MIT",
      bugs: {
        url: "https://github.com/GameBridgeAI/ts_serialize/issues",
      },
      homepage: "https://github.com/GameBridgeAI/ts_serialize",
      keywords: [
        "ts_serialize",
        "ts_serializable",
        "ts-serialize",
        "ts-serializable",
        "typescript",
        "serializable",
        "serialize",
        "deserialize",
        "serialization",
        "deserialization",
        "json",
        "node",
        "deno",
      ],
    },
  });

  await Deno.copyFile("LICENSE", `${outDir}/LICENSE`);
  await Deno.copyFile("README.md", `${outDir}/README.md`);
  await Deno.copyFile("CHANGELOG.md", `${outDir}/CHANGELOG.md`);
} catch (e) {
  console.log(e.message);
  printHelpText();
  Deno.exit(1);
}
