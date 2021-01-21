# 🥣 ts_serialize

[![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)
[![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)
[![github doc](https://img.shields.io/badge/github-doc-5279AA.svg)](https://gamebridgeai.github.io/ts_serialize)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/ts_serialize/mod.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero dependency library for serializing data.

`ts_serialize` can help you with:

1. Converting `camelCase` class members to `snake_case` JSON properties for use
   with a REST API
2. Excluding internal fields from REST API payloads
3. Converting data types to an internal format, for example: `Date`'s

## Supported Serialize Types

- [`JSON`](https://www.json.org/json-en.html)

## [Usage](https://gamebridgeai.github.io/ts_serialize/)

- [Installing](https://gamebridgeai.github.io/ts_serialize/installing)
- [Serializable and SerializeProperty](https://gamebridgeai.github.io/ts_serialize/serializable)
- [Strategies](https://gamebridgeai.github.io/ts_serialize/strategies)
- [Global transformKey](https://gamebridgeai.github.io/ts_serialize/transforming)
- [Polymorphism](https://gamebridgeai.github.io/ts_serialize/polymorphism)

## Built With

- [Deno](http://deno.land) 🦕

## Contributing

We have provided resources to help you request a new feature or report and fix a
bug.

- [CONTRIBUTING.md](./.github/CONTRIBUTING.md) - for guidelines when requesting
  a feature or reporting a bug or opening a pull request
- [DEVELOPMENT.md](./.github/DEVELOPMENT.md) - for instructions on setting up
  the environment and running the test suite
- [CODE_OF_CONDUCT.md](./.github/CODE_OF_CONDUCT.md) - for community guidelines

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

- **Scott Hardy** - _Initial work_ -
  [@shardyMBAI](https://github.com/shardyMBAI) 🐸
- **Chris Dufour** - _Initial work_ -
  [@ChrisDufourMB](https://github.com/ChrisDufourMB) 🍕 🐱 👑

See also the list of [contributors](./.github/CONTRIBUTORS.md) who participated
in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details

## Acknowledgments

- Our colleagues at [MindBridge](https://mindbridge.ai) for discussion and
  project planning
- [Parsing Dates with JSON](https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates)
  for knowledge
- [OAK Server](https://github.com/oakserver/oak) as a project structure example
