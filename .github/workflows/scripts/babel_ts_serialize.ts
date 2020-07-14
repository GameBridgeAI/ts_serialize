import babelCore from "https://dev.jspm.io/@babel/core";
import presetEnv from "https://dev.jspm.io/@babel/preset-env";
const [, source] = await Deno.bundle("./mod.ts");
const { code } = babelCore.transformSync(source, {
  filename: "dist/index.js",
  presets: [presetEnv],
  babelrc: false,
  configFile: false,
});

console.log(code);
