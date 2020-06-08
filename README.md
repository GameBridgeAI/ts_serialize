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
  notSerialized = "not-serialized";
}

assert(new Test().toJson(), `{"propertyOne":"Hello","property_two":"World!"}`);
const test = new Test().fromJson(
  `{"propertyOne":"From","property_two":"Json!", "notSerialized": "changed" }`
);
assertEquals(test.propertyOne, "From");
assertEquals(test.propertyTwo, "Json!");
assertEquals(test.notSerialized, "not-serialized");
```

### Advanced

`SerializeProperty` also excepts an options object with the properties:

- `serializedName` (Optional) {string} - Used as the key in the serialized object
- `toJsonStrategy` (Optional) {ToJsonStrategy} - Function or `ToJsonStrategy` used when serializing
- `fromJsonStrategy` (Optional) {FromJsonStrategy} - Function or `FromJsonStrategy` used when deserializing

**Strategies**

`Strartegies` are functions or a composed list of functions to execute on the values when
serializing or deserializing. The functions take one argument which is the value to process.

**Dates**

Dates can use the `fromJsonStrategy` to revive a serilaized string into a Date object. `ts_serialize`
provides a `ISODateFromJson` function to parse ISO Dates. `createDateStrategy()` can be use to make
a reviving date strattegy. Pass a regex to make your own.

```ts
class Test extends Serializable<Test> {
  @SerializeProperty({
    fromJsonStrategy: ISODateFromJson,
  })
  date!: Date;
}
const mockObj = new Test().fromJson(`{"date":"2020-06-04T19:01:47.831Z"}`);
assert(mockObj.date instanceof Date);
assertEquals(mockObj.date.getFullYear(), 2020);
```

```ts
const testDateStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);

class Test extends Serializable<Test> {
  @SerializeProperty({
    fromJsonStrategy: testDateStrategy,
  })
  date!: Date;
}
const mockObj = new Test().fromJson(`{"date":"2099-11-25"}`);
assert(mockObj.date instanceof Date);
assertEquals(mockObj.date.getFullYear(), 2099);
```

**Inheritance**

Inherited classes override the key when serializing. If you override
a propery any value used for that key will be overridden by the
child value. _With collisions the child always overides the parent_

```ts
class Test1 extends Serializable<Test1> {
  @SerializeProperty("serialize_me")
  serializeMe = "nice1";
}

class Test2 extends Test1 {
  @SerializeProperty("serialize_me")
  serializeMeInstead = "nice2";
}

const test = new Test2();
assertEquals(test.serializeMe, "nice1");
assertEquals(test.serializeMeInstead, "nice2");
assertEquals(test.toJson(), `{"serialize_me":"nice2"}`);
```

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
- [OAK Server](https://github.com/oakserver/oak) as a project structure example
