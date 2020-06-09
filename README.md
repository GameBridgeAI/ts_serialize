# ts_serialize ![ci](https://github.com/GameBridgeAI/ts_serialize/workflows/ci/badge.svg) ![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero dependency library for serializing data.

`ts_serialize` can help you with:

- converting camelCase class members to snake_case JSON properties for use with a REST API
- excluding internal fields from REST API payloads
- converting data types to an internal format, for expamle: `Date`'s

**Supported Serialize Types**

- [`JSON`](https://www.json.org/json-en.html)

### Installing

**Deno**

Add the `https://github.com/gamebridgeai/ts_serialize.git#v1.0.0` to your `deps.ts` file and export what you need.

**Node**

Add the URL to your `package.json` file in `dependencies`

```json
{
  "dependencies": {
    "ts_serialize": "git+https://github.com/gamebridgeai/ts_serialize.git#v1.0.0"
  }
}
```

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

`Strategies` are functions or a composed list of functions to execute on the values when
serializing or deserializing. The functions take one argument which is the value to process.

```ts
const myCustomFromJsonStrategy = (v: string): string => BigInt(v);
const myCustomToJsonStrategy = (v: BigInt): string => v.toString();

class Test extends Serializable<Test> {
  @SerializeProperty({
    serializedName: "big_int",
    fromJsonStrategy: myCustomFromJsonStrategy,
    toJsonStrategy: myCustomToJsonStrategy,
  })
  bigInt!: BigInt;
}

const mockObj = new Test().fromJson(`{"big_int":"9007199254740991"}`);
assertEquals(mockObj.bigInt.toString(), "9007199254740991");
assertEquals(mockObj.toJson(), "9007199254740991");
```

**Dates**

Dates can use the `fromJsonStrategy` to revive a serilaized string into a Date object. `ts_serialize`
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
const fromJsonStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);

class Test extends Serializable<Test> {
  @SerializeProperty({ fromJsonStratege })
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

**Nested Class Serialization**

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

```ts
class Test1 extends Serializable<Test1> {
  @SerializeProperty("serialize_me_1")
  serializeMe = "nice1";
}

class Test2 extends Serializable<Test2> {
  @SerializeProperty({
    serializedKey: "serialize_me_2",
    fromJsonStrategy: (json) => new Test1().fromJson(json),
  })
  nested!: Test1;
}

const test = new Test2();
test.fromJson(`{"serialize_me_2": { "serialize_me_1":"custom value"}}`);
assertEquals(test.nested.serializeMe, "custom value");
```

**Mulitple strategy functions**

`toJsonStrategy` and `fromJsonStrategy` also have provided functions with the same name
to build out strategies with multiple functions.

```ts
const addWord = (word: string) => (v: string) => `${v} ${word}`;
const shout = (v: string) => `${v}!!!`;
const fromJsonStrategy = fromJsonStrategy(addWord("World"), shout);

class Test extends Serializable<Test> {
  @SerializeProperty({ fromJsonStrategy })
  property!: string;
}

assertEquals(new Test().fromJson(`{"property":"Hello"}`), "Hello World!!!");
```

## Built With

- [Deno](http://deno.land) :sauropod:

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

- **Scott Hardy** - _Initial work_ - [@shardyMBAI](https://github.com/shardyMBAI) :frog:
- **Chris Dufour** - _Initial work_ - [@ChrisDufourMB](https://github.com/ChrisDufourMB) :pizza: :cat: :crown:

See also the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [MindBridge](https://mindbridge.ai) for support
- [Parsing Dates with JSON](https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates) for knowledge
- [OAK Server](https://github.com/oakserver/oak) as a project structure example
