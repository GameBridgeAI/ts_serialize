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

## Usage

`ts_serialize` supports both `deno` and `node`.

### Deno

`import`/`export` what you need from
`https://deno.land/x/ts_serialize@<version>/mod.ts` in your `deps.ts` file.
`<version>` will be a tag found on the
[deno releases](https://deno.land/x/ts_serialize) page. The version can be
omitted to get the latest release, however, for stability it is recommended to
use a tagged version.

```ts
export { /* ... */ } from "https://deno.land/x/ts_serialize/mod.ts";
```

### Node

Install with `NPM` or `yarn`

```
npm i @gamebridgeai/ts_serialize
```
or 
```
yarn add @gamebridgeai/ts_serialize
```

Then import from the package.

```ts
import { /* ... */ } from "@gamebridgeai/ts_serialize";
```

## Serializable and SerializeProperty

Import `Serializable` and `SerializeProperty`, extend `Serializable` from your
`class` and use the `SerializeProperty` decorator on any properties you want
serialized.

`Serializable` will add 5 methods:

- `fromJSON` - takes one argument, the JSON string or `Object` to deserialize
- `toJSON` - converts the model to a JSON string
- `tsSerialize` - converts the model to "Plain old Javascript object" with any
  provided key or value transformations
- `tsTransformKey` - called against every key, has one parameter, the key to transform, the return value is a string
- `clone` - returns a new refernce of the object with all properties cloned, takes the object as a parameter to override cloned property values

```ts
class TestClass extends Serializable {
  @SerializeProperty()
  public test: number = 99;

  @SerializeProperty("test_one")
  public test1: number = 100;
}
const testObj = new TestClass();
assert(testObj instanceof Serializable);
assertEquals(typeof testObj.toJSON, "function");
assertEquals(typeof testObj.fromJSON, "function");
assertEquals(typeof testObj.tsSerialize, "function");
assertEquals(typeof testObj.tsTransformKey, "function");
assertEquals(typeof testObj.clone, "function");
```

### SerializeProperty options

Passing a string or a function as an argument to `SerializeProperty` causes the
property to use that name as the key when serialized. The function has one
parameter, the `key` as string and should return a string.

`SerializeProperty` also excepts an options object with the properties:

- `serializedKey` (Optional) `{string | ToSerializedKeyStrategy}` - Used as the
  key in the serialized object
- `toJSONStrategy` (Optional) `{ToJSONStrategy}` - Used when serializing
- `fromJSONStrategy` (Optional) `{FromJSONStrategy}` - Used when deserializing

```ts
class Test extends Serializable {
  @SerializeProperty()
  propertyOne = "Hello";
  @SerializeProperty("property_two")
  propertyTwo = "World!";
  @SerializeProperty({ serializedKey: (key) => `__${key}__` })
  propertyThree = "foo";
  notSerialized = "not-serialized";
}
assertEquals(
  new Test().toJSON(),
  `{"propertyOne":"Hello","property_two":"World!","__propertyThree__":"foo"}`,
);
const testObj = new Test().fromJSON(
  `{"propertyOne":"From","property_two":"JSON!","__propertyThree__":"bar","notSerialized":"changed"}`,
);
assertEquals(testObj.propertyOne, "From");
assertEquals(testObj.propertyTwo, "JSON!");
assertEquals(testObj.notSerialized, "changed");
assertEquals(
  testObj.toJSON(),
  `{"propertyOne":"From","property_two":"JSON!","__propertyThree__":"bar"}`,
);
```
### Strategies

`Strategies` are functions or a composed list of functions to execute on the
values when serializing or deserializing. The functions take one argument which
is the value to process.

```ts
const fromJSONStrategy = (v: string): BigInt => BigInt(v);
const toJSONStrategy = (v: BigInt): string => v.toString();

class Test extends Serializable {
  @SerializeProperty({
    serializedKey: "big_int",
    fromJSONStrategy,
    toJSONStrategy,
  })
  bigInt!: BigInt;
}

const testObj = new Test().fromJSON(`{"big_int":"9007199254740991"}`);
assertEquals(testObj.bigInt.toString(), "9007199254740991");
```

### Multiple strategy functions

`toJSONStrategy` and `fromJSONStrategy` can use `composeStrategy` to build out
strategies with multiple functions.

```ts
const addWord = (word: string) => (v: string) => `${v} ${word}`;
const shout = (v: string) => `${v}!!!`;

class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: composeStrategy(addWord("World"), shout),
  })
  property!: string;
}

assertEquals(
  new Test().fromJSON(`{"property":"Hello"}`).property,
  "Hello World!!!",
);
```

### Dates

Dates can use the `fromJSONStrategy` to revive a serialized string into a Date
object. `ts_serialize` provides a `iso8601Date` function to parse ISO Dates.

```ts
class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: iso8601Date(),
  })
  date!: Date;
}

const testObj = new Test().fromJSON(`{"date":"2020-06-04T19:01:47.831Z"}`);
assert(testObj.date instanceof Date);
assertEquals(testObj.date.getFullYear(), 2020);
```

`createDateStrategy()` can be use to make a reviving date strategy. Pass a regex
to make your own.

```ts
class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
  })
  date!: Date;
}

const testObj = new Test().fromJSON(`{"date":"2099-11-25"}`);
assert(testObj.date instanceof Date);
assertEquals(testObj.date.getFullYear(), 2099);
```


### Inheritance

Inherited classes override the key when serializing. If you override a property
any value used for that key will be overridden by the child value. _With
collisions the child always overrides the parent_

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
assertEquals(testObj.toJSON(), `{"serialize_me":"nice2"}`);
```

### Nested Class Serialization

**ToJSON**

Serializing a nested class will follow the serialization rules set from the
class:

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
assertEquals(testObj.toJSON(), `{"serialize_me_2":{"serialize_me_1":"nice1"}}`);
```

**FromJSON**

Use a [strategy](./strategies) to revive the property into a class.
`toSerializable` is a provided function export that takes one parameter, the
instance type the object will take when revived, it will also revive to an array
of Serializable objects.

```ts
class Test1 extends Serializable {
  @SerializeProperty("serialize_me_1")
  serializeMe = "nice1";
}

class Test2 extends Serializable {
  @SerializeProperty({
    serializedKey: "serialize_me_2",
    fromJSONStrategy: toSerializable(Test1),
  })
  nested!: Test1;
}

const testObj = new Test2();
testObj.fromJSON(`{"serialize_me_2":{"serialize_me_1":"custom value"}}`);
assertEquals(testObj.nested.serializeMe, "custom value");
```

`toObjectContaining` revives a record of string keys to Serializable objects, it
will also revive to an array of Serializable objects.

```ts
class SomeClass extends Serializable {
  @SerializeProperty()
  someClassProp = "test";
}

class Test extends Serializable {
  @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
  test!: { [k: string]: SomeClass[] };
}

const testObj = new Test().fromJSON(
  {
    test: {
      testing: [{ someClassProp: "changed" }, { someClassProp: "changed" }],
    },
  },
);
assert(Array.isArray(testObj.test.testing));
assert(testObj.test.testing[0] instanceof Serializable);
assertEquals(testObj.test.testing[0].someClassProp, "changed");
```

## Short cutting the `@SerializeProperty` decorator

While `@SerializeProperty` is handy with to and from JSON strategies, it can
still be verbose to declare the strategies for each property. You can define
your owndecorator functions to wrap `@SerializeProperty` and provide the
`toJSONStrategy` and `fromJSONStrategy`. An example short cut is providing a
`type` to use with `toSerializable`. `getNewSerializable` is provided to allow a
raw serializable type or a function that returns a constructed serializable type
enabling constructor arguments:

```ts
export function DeserializeAs(
  type: unknown,
): PropertyDecorator {
  return SerializeProperty({ fromJSONStrategy: toSerializable(getNewSerializable(type)) });
}

class A extends Serializable {
  @SerializeProperty("property_a")
  public property: string;
}

class B extends Serializable {
  @DeserializeAs(A)
  public property: A;
  private privateProperty: string;

  constructor({ privateProperty = "" }: Partial<B>) {
    this.privateProperty = privateProperty;
  }
}

class C extends Serializable {
  @DeserializeAs(() => new B({ privateProperty: "From Class C" })))
  public property: B;
}
```
## Global transformKey

`Serializable` has an optional function `tsTransformKey(key: string): string`,
we also provide an interface `TransformKey` to implement for type safety. This
function can be provided to change all the keys without having to specify the
change for each property.

```ts
class TestTransformKey extends Serializable implements TransformKey {
  public tsTransformKey(key: string): string {
    return `__${key}__`;
  }

  @SerializeProperty()
  public test = "test";
}

assertEquals(new TestTransformKey().toJSON(), `{"__test__":"test"}`);
assertEquals(
  new TestTransformKey().fromJSON({ __test__: "changed" }).test,
  `changed`,
);
```

`tsTransformKey` will be inherited by children:

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
  new TestTransformKey3().toJSON(),
  `{"__test2__":"test2","__test3__":"test3"}`,
);
assertEquals(
  new TestTransformKey3().fromJSON({ __test3__: "changed" }).test3,
  `changed`,
);
```

Children can also override their parent `tsTransformKey` function:

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
  new TestTransformKey4().toJSON(),
  `{"__test2__":"test2","--test3--":"test3","--test4--":"test4"}`,
);
assertEquals(
  new TestTransformKey4().fromJSON({ "--test4--": "changed" }).test4,
  `changed`,
);
```

If `tsTransformKey` is implemented and `SerializeProperty` is provided a
`serializedKey` option, it will override the `tsTransformKey` function:

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
  new TestTransformKey2().toJSON(),
  `{"__test2__":"test2","changed":"change me","changed2":"change me2"}`,
);
assertEquals(
  new TestTransformKey2().fromJSON({ changed: "changed" }).changeMe,
  `changed`,
);
assertEquals(
  new TestTransformKey2().fromJSON({ changed2: "changed" }).changeMe2,
  `changed`,
);
```

`tsTransformKey` is an efficient way to deal with camelCase to snake_case
conversions.

## Polymorphism

The `@PolymorphicResolver` and `@PolymorphicSwitch` decorators can be used to
cleanly handle deserializing abstract types into their constituent
implementations.

### Polymorphic Swtich

The `@PolymorphicSwitch` decorator is a quick way to serialize simple
polymorphic types based on the properties of a child class.

Note that `@PolymorphicSwitch` can only be applied to child classes
deserializing from their direct parent class.

Properties decorated with `@PolymorphicSwitch` must also be serializable
properties. The from JSON strategy and associated serialized key of that
property will be used when comparing the value.

```ts
enum Colour {
  RED = "RED",
  BLUE = "BLUE",
}

abstract class MyColourClass extends Serializable {}

class MyRedClass extends MyColourClass {
  @SerializeProperty()
  @PolymorphicSwitch(() => new MyRedClass(), Colour.RED)
  public colour = Colour.RED;

  @SerializeProperty()
  public crimson = false;
}

// Serialize using JSON.parse, read `colour` off of the parsed object
// then compare to the value provided in `@PolymorphicSwitch`
const redClass = polymorphicClassFromJSON(
  MyColourClass,
  `{"colour":"RED","crimson":true}`,
);

console.log(`Is a red class? ${redClass instanceof MyRedClass}`);
// > Is a red class? true
console.log(`Is crimson? ${(redClass as MyRedClass).crimson}`);
// > Is crimson? true
```

You can also provide a test function instead of a value to check if the value
for the annotated property satisfies a more complex condition:

```ts
abstract class Currency extends Serializable {}

class DollarCurrency extends Currency {
  @SerializeProperty()
  // Match only "$""
  @PolymorphicSwitch(() => new DollarCurrency(), "$")
  public currencySymbol = "$";

  @SerializeProperty()
  public amount = 0;
}

class OtherCurrency extends Currency {
  @SerializeProperty()
  // Match any currency symbol OTHER than "$"
  @PolymorphicSwitch(
    () => new OtherCurrency(),
    (value) => value !== "$",
  )
  public currencySymbol = "";

  @SerializeProperty()
  public amount = 0;
}

const currencyClass = polymorphicClassFromJSON(
  Currency,
  `{"currencySymbol":"£","amount":300}`,
);

console.log(`Is OtherCurrency? ${currencyClass instanceof OtherCurrency}`);
// > Is OtherCurrency? true
console.log(`Amount: ${(currencyClass as OtherCurrency).amount}`);
// > Amount: 300
```

Multiple `@PolymorphicSwitch` annotations can be applied to a single class, if
necessary

```ts
abstract class MyAbstractClass extends Serializable {}

class MyClass extends MyAbstractClass {
  @SerializeProperty()
  @PolymorphicSwitch(() => new MyClass(), "$")
  @PolymorphicSwitch(() => new MyClass(), "dollar")
  @PolymorphicSwitch(
    () => new MyClass(),
    (value) => typeof value === "string" && value.includes("dollars"),
  )
  public myProperty = "$";

  @SerializeProperty()
  public amount = 0;
}

const myClass1 = polymorphicClassFromJSON(
  MyAbstractClass,
  `{"myProperty":"300 dollars"}`,
);
console.log(`Is myClass1 MyClass? ${myClass1 instanceof MyClass}`);

const myClass2 = polymorphicClassFromJSON(
  MyAbstractClass,
  `{"myProperty":"dollar"}`,
);
console.log(`Is myClass2 MyClass? ${myClass2 instanceof MyClass}`);
```

### Polymorphic Resolver

The following example shows how the `@PolymorphicResolver` decorator can be used
to directly determine the type of an abstract class implementor, which will then
be used when deserializing JSON input.

```ts
enum Colour {
  RED = "RED",
  BLUE = "BLUE",
}

abstract class MyColourClass extends Serializable {
  @SerializeProperty()
  public colour?: Colour;

  @PolymorphicResolver
  public static resolvePolymorphic(input: string): MyColourClass {
    const colourClass = new PolymorphicColourClass().fromJSON(input);

    switch (colourClass.colour) {
      case Colour.RED:
        return new MyRedClass();
      case Colour.BLUE:
        return new MyBlueClass();
      default:
        throw new Error(`Unknown Colour ${colourClass.colour}`);
    }
  }
}

// Helper class to parse the input and extract the colour property's value
class PolymorphicColourClass extends MyColourClass {
}

class MyRedClass extends MyColourClass {
  @SerializeProperty()
  private crimson = false;

  public isCrimson(): boolean {
    return this.crimson;
  }
}

class MyBlueClass extends MyColourClass {
  @SerializeProperty()
  private aqua = false;

  public isAqua(): boolean {
    return this.aqua;
  }
}

// Serialize using PolymorphicColourClass to determine the value of `colour`, then serialize using `MyRedClass`
const redClass = polymorphicClassFromJSON(
  MyColourClass,
  `{"colour":"RED","crimson":true}`,
);

console.log(`Is a red class? ${redClass instanceof MyRedClass}`);
// > Is a red class? true
console.log(`Is crimson? ${(redClass as MyRedClass).isCrimson()}`);
// > Is crimson? true
```

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

- **Scott Hardy** - _Initial work_ - [@hardy925](https://github.com/hardy925) 🐸
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
