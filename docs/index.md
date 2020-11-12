# 🥣 ts_serialize ![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg) ![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero dependency library for serializing data.

`ts_serialize` can help you with:

- converting `camelCase` class members to `snake_case` JSON properties for use with a REST API
- excluding internal fields from REST API payloads
- converting data types to an internal format, for example: `Date`'s

**Supported Serialize Types**

- [`JSON`](https://www.json.org/json-en.html)



 - [Installing](./installing.md)

### Basic

Import `Serializable` and `SerializeProperty`, extend `Serializable` with your `class`
and use the `SerializeProperty` decorator on any properties you want serialized.
Passing a string as an argument to `SerializeProperty` causes the property to use
that name as the key when serialized. A function can be passed instead to generate a
serialized key programmatically by transforming the property name.

`SerializeProperty` also excepts an options object with the properties:

- `serializedKey` (Optional) `{string | ToSerializedKeyStrategy}` - Used as the key in the serialized object
- `toJsonStrategy` (Optional) `{ToJsonStrategy}` - Used when serializing
- `fromJsonStrategy` (Optional) `{FromJsonStrategy}` - Used when deserializing

```ts
class Test extends Serializable {
  @SerializeProperty()
  propertyOne = "Hello";
  @SerializeProperty("property_two")
  propertyTwo = "World!";
  notSerialized = "not-serialized";
}

assertEquals(
  new Test().toJson(),
  `{"propertyOne":"Hello","property_two":"World!"}`
);
const testObj = new Test().fromJson(
  `{"propertyOne":"From","property_two":"Json!","notSerialized":"changed"}`
);
assertEquals(testObj.propertyOne, "From");
assertEquals(testObj.propertyTwo, "Json!");
assertEquals(testObj.notSerialized, "changed");
assertEquals(testObj.toJson(), `{"propertyOne":"From","property_two":"Json!"}`);
```

Transforming the property key via a function:

```ts
class Test extends Serializable {
  @SerializeProperty((propertyName) => `__${String(propertyName)}__`)
  propertyOne = "Hello, world!";
}

assertEquals(new Test().toJson(), `{"__propertyOne__":"Hello, world!"}`);
const testObj = new Test().fromJson(`{"__propertyOne__":"From JSON!"}`);
assertEquals(testObj.propertyOne, "From JSON!");
assertEquals(testObj.toJson(), `{"__propertyOne__":"From JSON!"}`);
```

#### Transforming Keys

`Serializable` has a optional function `tsTransformKey(key: string): string`. This function
can be provided to change all the keys without having to specify the change for each property.

```ts
class TestTransformKey extends Serializable implements TransformKey {
  public tsTransformKey(key: string): string {
    return `__${key}__`;
  }

  @SerializeProperty()
  public test = "test";
}

assertEquals(new TestTransformKey().toJson(), `{"__test__":"test"}`);
assertEquals(
  new TestTransformKey().fromJson({ __test__: "changed" }).test,
  `changed`
);
```

`tsTransformKey` will be inherited by children

```ts
class TestTransformKey extends Serializable implements TransformKey {
  public tsTransformKey(key: string): string {
    return `__${key}__`;
  }
}

class TestTransformKey2 extends TestTransformKey {
  @SerializeProperty()
  public test2 = "test2";
}

class TestTransformKey3 extends TestTransformKey2 {
  @SerializeProperty()
  public test3 = "test3";
}

assertEquals(
  new TestTransformKey3().toJson(),
  `{"__test2__":"test2","__test3__":"test3"}`
);
assertEquals(
  new TestTransformKey3().fromJson({ __test3__: "changed" }).test3,
  `changed`
);
```

Children can also override their parent `tsTransformKey` function.

```ts
class TestTransformKey extends Serializable implements TransformKey {
  public tsTransformKey(key: string): string {
    return `__${key}__`;
  }
}

class TestTransformKey2 extends TestTransformKey {
  @SerializeProperty()
  public test2 = "test2";
}

class TestTransformKey3 extends TestTransformKey2 implements TransformKey {
  public tsTransformKey(key: string): string {
    return `--${key}--`;
  }
  @SerializeProperty()
  public test3 = "test3";
}

class TestTransformKey4 extends TestTransformKey3 {
  @SerializeProperty()
  public test4 = "test4";
}
assertEquals(
  new TestTransformKey4().toJson(),
  `{"__test2__":"test2","--test3--":"test3","--test4--":"test4"}`
);
assertEquals(
  new TestTransformKey4().fromJson({ "--test4--": "changed" }).test4,
  `changed`
);
```

If `tsTransformKey` is implemented and `SerializeProperty` is provided a
`serializedKey` option, it will override the `tsTransformKey` function

```ts
class TestTransformKey extends Serializable implements TransformKey {
  public tsTransformKey(key: string): string {
    return `__${key}__`;
  }
}

class TestTransformKey2 extends TestTransformKey {
  @SerializeProperty()
  public test2 = "test2";

  @SerializeProperty("changed")
  public changeMe = "change me";

  @SerializeProperty({ serializedKey: "changed2" })
  public changeMe2 = "change me2";
}

assertEquals(
  new TestTransformKey2().toJson(),
  `{"__test2__":"test2","changed":"change me","changed2":"change me2"}`
);
assertEquals(
  new TestTransformKey2().fromJson({ changed: "changed" }).changeMe,
  `changed`
);
assertEquals(
  new TestTransformKey2().fromJson({ changed2: "changed" }).changeMe2,
  `changed`
);
```

`tsTransformKey` is an efficient way to deal with
camelCase to snake_case conversions.

### Advanced

#### Strategies

`Strategies` are functions or a composed list of functions to execute on the values when
serializing or deserializing. The functions take one argument which is the value to process.

```ts
const fromJsonStrategy = (v: string): BigInt => BigInt(v);
const toJsonStrategy = (v: BigInt): string => v.toString();

class Test extends Serializable {
  @SerializeProperty({
    serializedKey: "big_int",
    fromJsonStrategy,
    toJsonStrategy,
  })
  bigInt!: BigInt;
}

const testObj = new Test().fromJson(`{"big_int":"9007199254740991"}`);
assertEquals(testObj.bigInt.toString(), "9007199254740991");
```

#### Multiple strategy functions

`toJsonStrategy` and `fromJsonStrategy` can use `composeStrategy` to build out
strategies with multiple functions.

```ts
const addWord = (word: string) => (v: string) => `${v} ${word}`;
const shout = (v: string) => `${v}!!!`;

class Test extends Serializable {
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

#### Dates

Dates can use the `fromJsonStrategy` to revive a serialized string into a Date object. `ts_serialize`
provides a `ISODateFromJson` function to parse ISO Dates.

```ts
class Test extends Serializable {
  @SerializeProperty({
    fromJsonStrategy: ISODateFromJson,
  })
  date!: Date;
}

const testObj = new Test().fromJson(`{"date":"2020-06-04T19:01:47.831Z"}`);
assert(testObj.date instanceof Date);
assertEquals(testObj.date.getFullYear(), 2020);
```

`createDateStrategy()` can be use to make
a reviving date strategy. Pass a regex to make your own.

```ts
class Test extends Serializable {
  @SerializeProperty({
    fromJsonStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
  })
  date!: Date;
}

const testObj = new Test().fromJson(`{"date":"2099-11-25"}`);
assert(testObj.date instanceof Date);
assertEquals(testObj.date.getFullYear(), 2099);
```

#### Inheritance

Inherited classes override the key when serializing. If you override
a property any value used for that key will be overridden by the
child value. _With collisions the child always overrides the parent_

```ts
class Test1 extends Serializable {
  @SerializeProperty("serialize_me")
  serializeMe = "nice1";
}

class Test2 extends Test1 {
  @SerializeProperty("serialize_me")
  serializeMeInstead = "nice2";
}

const testObj = new Test2();
assertEquals(testObj.serializeMe, "nice1");
assertEquals(testObj.serializeMeInstead, "nice2");
assertEquals(testObj.toJson(), `{"serialize_me":"nice2"}`);
```

#### Nested Class Serialization

ToJson:

```ts
class Test1 extends Serializable {
  @SerializeProperty("serialize_me_1")
  serializeMe = "nice1";
}

class Test2 extends Serializable {
  @SerializeProperty({
    serializedKey: "serialize_me_2",
  })
  nested: Test1 = new Test1();
}

const testObj = new Test2();
assertEquals(testObj.toJson(), `{"serialize_me_2":{"serialize_me_1":"nice1"}}`);
```

FromJson:

`fromJsonAs` is a provided function export that takes one parameter,
the instance type the object will take when revived. `fromJson` is used
to revive the object.

```ts
class Test1 extends Serializable {
  @SerializeProperty("serialize_me_1")
  serializeMe = "nice1";
}

class Test2 extends Serializable {
  @SerializeProperty({
    serializedKey: "serialize_me_2",
    fromJsonStrategy: fromJsonAs(Test1),
  })
  nested!: Test1;
}

const testObj = new Test2();
testObj.fromJson(`{"serialize_me_2":{"serialize_me_1":"custom value"}}`);
assertEquals(testObj.nested.serializeMe, "custom value");
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
