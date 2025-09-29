#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-run=npm --allow-net=jsr.io --frozen
// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { build, emptyDir } from "@deno/dnt";
import { parseArgs } from "@std/cli";

const entryPointDefault = "./mod.ts";
const outDirDefault = "./dist";
const versionDefault = "v0.0.0-test";

const helpText = `
Deno to node transpiler, converts the ts_serialize module to a node compatible \
module, and writes it to .github/workflows/npm, or the directory of your choice.

This must be run from the project root if using the default arguments.

Usage:
	./_build_npm.ts [-v ${versionDefault}] [-e ${entryPointDefault}] [-o ${outDirDefault}]
	./_build_npm.ts --help

Command line arguments:
	-h,  --help               Prints this help message, then exits.
	-v,  --version=[version]  The version value to set in the resulting package.json. Defaults to "${versionDefault}".
	-e,  --entry-point=[path] The path to the mod.ts file to transpile into the npm package. Defaults to "${entryPointDefault}"
	-o,  --out=[path]         The path to the target directory where the built files should be placed. Defaults to "${outDirDefault}"
`;

function printHelpText(message = "") {
  if (message.length) {
    console.error(`\n${message}`);
    console.log(helpText);
    Deno.exit(1);
  }
  console.log(helpText);
  Deno.exit(0);
}

const flags = parseArgs(Deno.args, {
  string: ["v", "e", "o"],
  boolean: ["h"],
  alias: { h: "help", e: "entry-point", v: "version", o: "out" },
  default: { e: entryPointDefault, o: outDirDefault, v: versionDefault },
  unknown: () => printHelpText("Unknown argument"),
});

if (flags.h) {
  printHelpText();
}

await Deno.remove(`${flags.o}`, { recursive: true }).catch((_) => {});

try {
  await emptyDir(flags.o);

  await build({
    importMap: "./deno.json",
    entryPoints: [flags.e],
    outDir: flags.o,
    compilerOptions: { lib: ["ESNext"], experimentalDecorators: true },
    shims: {
      deno: true,
    },
    package: {
      name: "@gamebridgeai/ts_serialize",
      version: flags.v,
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

  await Deno.copyFile("LICENSE", `${flags.o}/LICENSE`);
  await Deno.copyFile("README.md", `${flags.o}/README.md`);
  await Deno.copyFile("CHANGELOG.md", `${flags.o}/CHANGELOG.md`);
} catch (e) {
  const { message } = e instanceof Error ? e : { message: `${e}` };
  printHelpText(message);
}
