# 🥣 ts_serialize 

[![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg) 
[![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg) 
[![github doc](https://img.shields.io/badge/github-doc-5279AA.svg)](https://gamebridgeai.github.io/ts_serialize)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/ts_serialize/mod.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


A zero dependency library for serializing data.

`ts_serialize` can help you with:

1. Converting `camelCase` class members to `snake_case` JSON properties for use with a REST API
2. Excluding internal fields from REST API payloads
3. Converting data types to an internal format, for example: `Date`'s

### Supported Serialize Types
- [`JSON`](https://www.json.org/json-en.html)

### Usage
- [Installing](./installing)
- [Serializable and SerializeProperty](./serializable)
- [Strategies](./strategies)
- [Global transformKey](./transforming)

### Contributing

We have provided resources to help you request a new feature or report and fix
a bug.

- [CONTRIBUTING.md](https://github.com/GameBridgeAI/ts_serialize/tree/develop/.github/CONTRIBUTING.md) - for guidelines when requesting a feature or reporting a bug or opening a pull request
- [DEVELOPMENT.md](https://github.com/GameBridgeAI/ts_serialize/tree/develop/.github/DEVELOPMENT.md) - for instructions on setting up the environment and running the test suite
- [CODE_OF_CONDUCT.md](https://github.com/GameBridgeAI/ts_serialize/tree/develop/.github/CODE_OF_CONDUCT.md) - for community guidelines

