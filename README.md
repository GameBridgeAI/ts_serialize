# ts_serialize ![](https://github.com/GameBridgeAI/ts_serialize/workflows/ci/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero dependency library for serializing data.

`ts_serialize` can help you with:

- converting camelCase class members to snake_case JSON properties for use with a REST API
- excluding internal fields from REST API payloads
- converting data types to an internal format, for expamle: `Date`'s

**Supported Serialize Types**

- [`JSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)

### Installing

**Deno**

Add the URL to your `deps.ts` file and export what you need.

**Node**

TBD

## Usage

### Basic

Import `Serializable` and `SerializeProperty`, extend `Serializable` with your `class`
and use the `SerializeProperty` decorator on any properties you want serialized.
Passing a string as an argument to `SerializeProperty` causes the property to use
that name as the key when serialized.

```ts
class Test extends Serializable<Test> {
  @SerializeProperty()
  propertyOne = "Hello";
  @SerializeProperty("property_two")
  propertyTwo = "World!";
}

assert(new Test().toJson(), `{"propertyOne":"Hello","property_two":"World!"}`);
const test = new Test().from(`{"propertyOne":"From","property_two":"Json!"}`);
assert(test.propertyOne, "From");
assert(test.propertyTwo, "Json!");
```

## Known Issues

Currently you cannot serialize a `static` member.

## Built With

- [Deno](http://deno.land) :sauropod:

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

- **Scott Hardy** - _Initial work_ - [@shardyMBAI](https://github.com/shardyMBAI) :frog:
- **Chris Dufour** - _Initial work_ - [@PizzaCatKing](https://github.com/PizzaCatKing) :pizza: :cat: :crown:

See also the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [MindBridge](https://mindbridge.ai) for support
- [Parsing Dates with JSON](https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates) for knowledge
- [OAK Server](https://github.com/oakserver/oak) for example code

```

```
