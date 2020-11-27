# 🥣 ts_serialize 

[![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg) 
[![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg) 
[![github doc](https://img.shields.io/badge/github-doc-5279AA.svg)](https://gamebridgeai.github.io/ts_serialize)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/ts_serialize/mod.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installing

ts_serialize supports both `deno` and `node`.

### Deno

`import`/`export` what you need from `https://deno.land/x/ts_serialize@<version>/mod.ts`
in your `deps.ts` file. `<version>` will be a tag found on the
[deno releases](https://deno.land/x/ts_serialize) page. The version can be omitted
to get the latest release, however, for stability it is recommended to use a tagged version.

```ts
export {
  composeStrategy,
  createDateStrategy,
  toSerializable,
  FromJSONStrategy,
  iso8601Date,
  Serializable,
  SerializeProperty,
  ToJSONStrategy,
  TransformKey,
} from "https://deno.land/x/ts_serialize/mod.ts";
```

[Deno Example](https://github.com/GameBridgeAI/ts_serialize/tree/develops/examples/deno)

### Node

Install with `NPM`
```
npm i @gamebridgeai/ts_serialize
```

Then import from the package.

```ts
import {
  composeStrategy,
  createDateStrategy,
  toSerializable,
  FromJSONStrategy,
  iso8601Date,
  Serializable,
  SerializeProperty,
  ToJSONStrategy,
  TransformKey,
} from "@gamebridgeai/ts_serialize";
```

[Node Example](https://github.com/GameBridgeAI/ts_serialize/tree/develop/examples/node)


Once installed see our docs on how to use [Serializable and SerializeProperty](./serializable)
