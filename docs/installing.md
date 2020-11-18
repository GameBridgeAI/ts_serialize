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
  fromJsonAs,
  FromJsonStrategy,
  iso8601Date,
  Serializable,
  SerializeProperty,
  ToJsonStrategy,
  TransformKey,
} from "https://deno.land/x/ts_serialize/mod.ts";
```

[Deno Example](../examples/deno)

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
  fromJsonAs,
  FromJsonStrategy,
  iso8601Date,
  Serializable,
  SerializeProperty,
  ToJsonStrategy,
  TransformKey,
} from "@gamebridgeai/ts_serialize";
```

[Node Example](../examples/node)


Once installed see our docs on how to use [Serializable and SerializeProperty](./serializable)
