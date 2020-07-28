from the root folder

- `deno run --unstable --allow-read ./.github/workflows/scripts/babel_ts_serialize.ts > example/node_modules/ts_serialize/index.js`
- `cp types.d.ts example/node_modules/ts_serialize`

from the `example` folder

- `npm install -g typescript` (if `tsc` is not available)
- `tcs -p tsconfig.json`
- `node test.js`

:tada:
