# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- missing copyright statement
- basic benchmark tests
- update deno@1.7.1, std@0.85.0
- change builds to use v1.x
- removed deno install from build script
- deno fmt with new rules

## [v1.2.0] - 2021-01-22

- minor for new test targets

## [v1.1.7] - 2021-01-21

### Changed

- github action updates test/release

## [v1.1.6] - 2021-01-21

### Add

- update nodeJS types

## [v1.1.5] - 2021-01-20

### Added

- docs for @SerializeProperty short cut functions
- new `strategy/utils.ts` exposing `getNewSerializable(type)` for custom
  decorators
- fixes #100
- fixes #105
- fixes #99

### Changed

- std@0.84.0

## [v1.1.4] - 2021-01-19

### Changed

- Chore: update copyright

## [v1.1.3] - 2021-01-08

### Changed

- deno@1.6.3 fixing #96
- std@0.83.0

## [v1.1.2] - 2021-01-08

### Changed

- fixed a typo in nodeJS export

## [v1.1.1] - 2021-01-01

### Added

- 100% test coverage

### Changed

- move private function to external

## [v1.1.0] - 2020-12-18

### Added

- `toObjectContaining` and `fromObjectContaining` fixing #89

## Changed

- deno@1.6.0
- std@0.80.0

## [v1.0.0] - 2020-11-29

### Added

- more docs
- new blog post md

## [v0.5.0] - 2020-11-27

### Changed

- fixed #83
- fixed #81
- fixed #63
- **breaking** the great json->JSON change program wide too follow the JS
  convention
- **breaking** fromJSONas -> toSerializable
- deno@1.5.4
- std@0.79.0
- moved lots of code

### Added

- new error_messages.ts file
- Added `PolymorphicResolver` and `PolymorphicSwitch` decorators, and
  `polymorphicClassFromJSON` function for deserializing polymorphic data
  structures

## [v0.4.0] - 2020-11-19

### Changed

- **breaking** `ISODateFromJSON` renamed to `iso8601Date`

### Added

- better iso 8601 parsing support

## [v0.3.6] - 2020-11-11

### Changed

- links and typos

## [v0.3.5] - 2020-11-11

### Changed

- remove `-c tsconfig` option from `deno` cli calls
- removed `isolatedModules` option from tsconfig
- removed duplicate test
- std@0.77.0
- deno@1.5.2
- updated types

### Added

- add [github pages](https://gamebridgeai.github.io/ts_serialize/)

## [v0.3.4] - 2020-11-11

### Changed

- house cleaning types and clean up releases :/

## [v0.3.0 - v0.3.3] - 2020-11-09

### Changed

_The input to fromJSON() is now a JSONValue, enforcing basic JSON requirements:
Property values must be legal JSON values. This is meant to allow the compiler
to flag accidental deserializations of already-deserialized objects._

- updated node example to be a properly formatted node module
- deno@1.5.1
- std@0.76.0
- fmt changes with deno upgrade
- fixed #64
- fixed #62
- fixed #59

### Added

- interface `tsTransformKey`
- global transformKey processing and inheritance and overrides
- TransformKey tests
- new examples for node and deno
- Added ability to use function as serialized key to transform property name

## [v0.2.3-v0.2.5] - 2020-09-15

### Changed

- set up new deno deploy webhook

## [v0.1.1-v0.2.2] - 2020-09-14

### NPM RELEASE!!

### Added

- `/examples` for Node and Deno environments

### Changed

- upgrade deno@1.4.0 and std/test@0.61.0
- added automated npm deploys

## [v0.1.0] - 2020-6-25

### Changed

- various ci related things
- added `as` exported function

## [v0.0.12] - 2020-6-09

### Added

- released privately as a part of a demo

### Changed

- various spelling fixes

## [v0.0.3 - v0.0.11] - 2020-6-09

### Added

- npm package.json generation via ci

### Changed

- various ci related things

## [v0.0.2] - 2020-6-09

### Added

- code of conduct file

### Changed

- various spelling fixes
- moved code of conduct to new file
- test example in development.md

## [v0.0.1] - 2020-6-08

### Added

- issue templates for bugs and RFC's
- pr template
- readme updates

### Changed

- n/a
