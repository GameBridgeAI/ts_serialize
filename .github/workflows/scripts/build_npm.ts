import { build, emptyDir } from "https://deno.land/x/dnt@0.22.0/mod.ts";
import { parse } from "https://deno.land/std@0.133.0/flags/mod.ts";

/* Arguments:
 * -v {version} / --version {version} - The version value to set in the resulting package.json. Required.
 * -o {path} / --out {path} - The path to the target directory where the built files should be placed
 */

const flags = parse(Deno.args);

const version = flags["v"] || flags["version"];
const outDir = flags["o"] || flags["out"] || "../dist";

if (!version) {
  throw new Error("The version property must be set! Please set");
}

await emptyDir(outDir);

await build({
  entryPoints: ["../../../mod.ts"],
  outDir,
  shims: {
    // see JS docs for overview and more options
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
    homepage: "https://gamebridgeai.github.io/ts_serialize",
    keywords: [
      "typescript",
      "serialize",
      "serialization",
      "JSON",
      "node",
      "deno",
      "ts_serialize",
      "ts-serialize",
    ],
  },
});
