# 🥣 ts_serialize ![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg) ![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero dependency library for serializing data.

`ts_serialize` can help you with:

- converting `camelCase` class members to `snake_case` JSON properties for use with a REST API
- excluding internal fields from REST API payloads
- converting data types to an internal format, for example: `Date`'s

**Supported Serialize Types**

- [`JSON`](https://www.json.org/json-en.html)

## Installing

### Deno

`import`/`export` what you need from `https://deno.land/x/ts_serialize@<version>/mod.ts`
in your `deps.ts` file. `<version>` will be a a tag found on our
[releases](https://github.com/GameBridgeAI/ts_serialize/releases) page. The version can be omitted
to get the develop branch, however, for stability it is recommended to use a tagged version.

### Node

Add the URL to your `package.json` file in `dependencies`

```json
{
  "dependencies": {
    "ts_serialize": "git+https://github.com/GameBridgeAI/ts_serialize.git#<version>"
  }
}
```

`<version>` will be a a tag found on our
[releases](https://github.com/GameBridgeAI/ts_serialize/releases) page. The version can be omitted
to get the default branch, however, it is recommended to use a tagged version.

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
  `{"propertyOne":"From","property_two":"Json!","notSerialized":"changed"}`
);
assertEquals(test.propertyOne, "From");
assertEquals(test.propertyTwo, "Json!");
assertEquals(test.notSerialized, "changed");
assertEquals(test.toJson(), `{"propertyOne":"From","property_two":"Json!"}`);
```

### Advanced

`SerializeProperty` also excepts an options object with the properties:

- `serializedKey` (Optional) {string} - Used as the key in the serialized object
- `toJsonStrategy` (Optional) {ToJsonStrategy} - Function or `ToJsonStrategy` used when serializing
- `fromJsonStrategy` (Optional) {FromJsonStrategy} - Function or `FromJsonStrategy` used when deserializing

#### Strategies

`Strategies` are functions or a composed list of functions to execute on the values when
serializing or deserializing. The functions take one argument which is the value to process.

```ts
const fromJsonStrategy = (v: string): BigInt => BigInt(v);
const toJsonStrategy = (v: BigInt): string => v.toString();

class Test extends Serializable<Test> {
  @SerializeProperty({
    serializedKey: "big_int",
    fromJsonStrategy,
    toJsonStrategy,
  })
  bigInt!: BigInt;
}

const mockObj = new Test().fromJson(`{"big_int":"9007199254740991"}`);
assertEquals(mockObj.bigInt.toString(), "9007199254740991");
```

#### Dates

Dates can use the `fromJsonStrategy` to revive a serialized string into a Date object. `ts_serialize`
provides a `ISODateFromJson` function to parse ISO Dates.

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

`createDateStrategy()` can be use to make
a reviving date strategy. Pass a regex to make your own.

```ts
class Test extends Serializable<Test> {
  @SerializeProperty({
    fromJsonStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
  })
  date!: Date;
}

const test = new Test().fromJson(`{"date":"2099-11-25"}`);
assert(test.date instanceof Date);
assertEquals(test.date.getFullYear(), 2099);
```

#### Inheritance

Inherited classes override the key when serializing. If you override
a property any value used for that key will be overridden by the
child value. _With collisions the child always overrides the parent_

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

#### Nested Class Serialization

ToJson:

```ts
class Test1 extends Serializable<Test1> {
  @SerializeProperty("serialize_me_1")
  serializeMe = "nice1";
}

class Test2 extends Serializable<Test2> {
  @SerializeProperty({
    serializedKey: "serialize_me_2",
  })
  nested: Test1 = new Test1();
}

const test = new Test2();
assertEquals(test.toJson(), `{"serialize_me_2":{"serialize_me_1":"nice1"}}`);
```

FromJson:

`reviveFromJsonAs` is a provided function export that takes one parameter,
the instance type the object will take when revived. `fromJson` is used
to revive the object.

```ts
class Test1 extends Serializable<Test1> {
  @SerializeProperty("serialize_me_1")
  serializeMe = "nice1";
}

class Test2 extends Serializable<Test2> {
  @SerializeProperty({
    serializedKey: "serialize_me_2",
    fromJsonStrategy: reviveFromJsonAs(Test1),
  })
  nested!: Test1;
}

const test = new Test2();
test.fromJson(`{"serialize_me_2":{ "serialize_me_1":"custom value"}}`);
assertEquals(test.nested.serializeMe, "custom value");
```

#### Multiple strategy functions

`toJsonStrategy` and `fromJsonStrategy` can use `composeStrategy` to build out
strategies with multiple functions.

```ts
const addWord = (word: string) => (v: string) => `${v} ${word}`;
const shout = (v: string) => `${v}!!!`;

class Test extends Serializable<Test> {
  @SerializeProperty({
    fromJsonStrategy: composeStrategy(addWord("World"), shout),
  })
  property!: string;
}

assertEquals(
  new Test().fromJson(`{"property":"Hello"}`).property,
  "Hello World!!!"
);
```

## Built With

- [Deno](http://deno.land) :sauropod:

## Contributing

We have provided resources to help you request a new feature or report and fix
a bug.

- [CONTRIBUTING.md](./.github/CONTRIBUTING.md) - for guidelines when requesting a feature or reporting a bug or opening a pull request
- [DEVELOPMENT.md](./.github/DEVELOPMENT.md) - for instructions on setting up the environment and running the test suite
- [CODE_OF_CONDUCT.md](./.github/CODE_OF_CONDUCT.md) - for community guidelines

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

- **Scott Hardy** - _Initial work_ - [@shardyMBAI](https://github.com/shardyMBAI) :frog:
- **Chris Dufour** - _Initial work_ - [@ChrisDufourMB](https://github.com/ChrisDufourMB) :pizza: :cat: :crown:

See also the list of [contributors](./.github/CONTRIBUTORS.md) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- Our colleagues at [MindBridge](https://mindbridge.ai) for discussion and project planning
- [Parsing Dates with JSON](https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates) for knowledge
- [OAK Server](https://github.com/oakserver/oak) as a project structure example
