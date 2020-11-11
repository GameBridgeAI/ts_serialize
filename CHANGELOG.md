# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

### Added

## [v0.3.3] - 2020-11-11

### Changed
- house cleaning types and clean up releases :/


## [v0.3.0 - v0.3.3] - 2020-11-09

### Changed

_The input to fromJson() is now a JsonValue, enforcing basic JSON requirements:
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
- added `fromJsonAs` exported function

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
