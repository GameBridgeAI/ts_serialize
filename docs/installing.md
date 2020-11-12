# Installing

ts_serialize supports both `deno` and `node`.

## Deno

`import`/`export` what you need from `https://deno.land/x/ts_serialize@<version>/mod.ts`
in your `deps.ts` file. `<version>` will be a a tag found on the
[deno releases](https://deno.land/x/ts_serialize) page. The version can be omitted
to get the latest release, however, for stability it is recommended to use a tagged version.

```ts
export {
  composeStrategy,
  createDateStrategy,
  fromJsonAs,
  FromJsonStrategy,
  ISODateFromJson,
  Serializable,
  SerializeProperty,
  ToJsonStrategy,
  TransformKey,
} from "https://deno.land/x/ts_serialize/mod.ts";
```

[Deno Example](../examples/deno)

## Node

`npm i @gamebridgeai/ts_serialize`

```ts
import {
  composeStrategy,
  createDateStrategy,
  fromJsonAs,
  FromJsonStrategy,
  ISODateFromJson,
  Serializable,
  SerializeProperty,
  ToJsonStrategy,
  TransformKey,
} from "@gamebridgeai/ts_serialize";
```

[Node Example](../examples/node)

