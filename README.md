# 🥣 ts_serialize

[![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)
[![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)
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

`export` what you need from `https://deno.land/x/ts_serialize/mod.ts`

> ⚠️ _Warning_ The examples in this README pull from `develop` You would want to
> "pin" to a particular version which is compatible with the version of Deno you
> are using and has a fixed set of APIs you would expect. `https://deno.land/x/`
> supports using git tags in the URL to direct you at a particular version. So
> to use version 2.0.0 of ts_serializec you would want to import
> `https://deno.land/x/ts_serialize@v2.0.0/mod.ts`.

### Node

Install with `npm i @gamebridgeai/ts_serialize` or
`yarn add @gamebridgeai/ts_serialize`

## `Serializable` and `SerializeProperty`

`Serializable` is an abstract class to extend, it will add 5 methods to the
class extending it.

```ts
import { Serializable } from "./mod.ts";
import { assert, assertEquals, test } from "./test_deps.ts";

test({
  name: "Serializable adds 5 methods",
  fn() {
    class TestClass extends Serializable {}
    const testObj = new TestClass();
    assert(testObj instanceof Serializable);
    assertEquals(typeof testObj.toJSON, "function");
    assertEquals(typeof testObj.fromJSON, "function");
    assertEquals(typeof testObj.tsSerialize, "function");
    assertEquals(typeof testObj.tsTransformKey, "function");
    assertEquals(typeof testObj.clone, "function");
  },
});
```

`SerializeProperty` is the
[property decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#property-decorators)
used before a property to add the property to the serialization logic.

```ts
import { Serializable, SerializeProperty } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Serializes properties adds to serialization logic",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      testName = "toJSON";
    }
    assertEquals(new Test().toJSON(), `{"testName":"toJSON"}`);
    const testObj = new Test().fromJSON(`{"testName":"fromJSON"}`);
    assertEquals(testObj.testName, "fromJSON");
  },
});
```

### Methods

Each method has an implementable interface if you wish to provide your own
functionality.

#### `fromJSON`

Takes one argument, the JSON `string` or `JSONObject` to deserialize creating an
object. `fromJSON` will perform provided `tsTransformKey` operations and
strategy value transformations.

```ts
import { Serializable } from "./mod.ts";
import { assert, test } from "./test_deps.ts";

test({
  name: "Method fromJSON",
  fn() {
    class TestClass extends Serializable {}
    const testObjOne = new TestClass().fromJSON({});
    const testObjTwo = new TestClass().fromJSON("{}");
    assert(testObjOne instanceof TestClass);
    assert(testObjTwo instanceof TestClass);
  },
});
```

#### `toJSON`

Converts the model to a JSON string

```ts
import { Serializable } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Method toJSON",
  fn() {
    class TestClass extends Serializable {}
    const testObj = new TestClass().toJSON();
    assertEquals(typeof testObj, "string");
    assertEquals(testObj, "{}");
  },
});
```

#### `clone`

Returns a new reference of the object with all properties cloned, takes the
object as a parameter to override cloned property values

```ts
import { Serializable } from "./mod.ts";
import { assert, test } from "./test_deps.ts";

test({
  name: "Method clone",
  fn() {
    class Clone extends Serializable {}
    const testObj = new Clone();
    assert(testObj !== testObj.clone());
  },
});
```

#### `tsSerialize`

Converts the model to "Plain old Javascript object" with any provided
`tsTransformKey` or value transformations

```ts
import { Serializable } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Method tsSerialize",
  fn() {
    class TestClass extends Serializable {}
    const testObj = new TestClass().tsSerialize();
    assertEquals(typeof testObj, "object");
    assertEquals(testObj, {});
  },
});
```

#### `tsTransformKey`

Called against every key, has one parameter, the key to transform. The return
value is a string. Defaults to returning the parameter

```ts
import { Serializable, SerializeProperty, TransformKey } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Method tsTransformKey",
  fn() {
    class TestClassDefault extends Serializable {
      @SerializeProperty()
      testProperty = "hello world";
    }
    class TestClassCustom extends Serializable implements TransformKey {
      public tsTransformKey(input: string): string {
        return `__${input}__`;
      }
      @SerializeProperty()
      testProperty = "hello world";
    }
    const testObjOne = new TestClassDefault().fromJSON(
      `{"testProperty":"changed"}`,
    );
    assertEquals(testObjOne.testProperty, "changed");
    const testObjTwo = new TestClassCustom().fromJSON(
      `{"__testProperty__":"changed"}`,
    );
    assertEquals(testObjTwo.testProperty, "changed");
    assertEquals(testObjTwo.toJSON(), `{"__testProperty__":"changed"}`);
    assertEquals(testObjTwo.tsSerialize(), { __testProperty__: "changed" });
  },
});
```

Key transformations will be inherited by children.

```ts
import { Serializable, SerializeProperty, TransformKey } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "tsTransformKey inheritance",
  fn() {
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
  },
});
```

Children can also override their parent `tsTransformKey` function.

```ts
import { Serializable, SerializeProperty, TransformKey } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Child tsTransformKey",
  fn() {
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
  },
});
```

If `tsTransformKey` is implemented and `SerializeProperty` is provided a
`serializedKey` option, it will override the `tsTransformKey` function

```ts
import { Serializable, SerializeProperty, TransformKey } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "tsTransformKey overrides",
  fn() {
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
  },
});
```

### SerializeProperty options

Passing a string or a function as an argument to `SerializeProperty` causes the
property to use that name as the key when serialized. The function has one
parameter, the `key` as string and should return a string.

`SerializeProperty` also excepts an optional options object with the properties

#### `serializedKey`

(Optional) `{string | ToSerializedKeyStrategy}` used as the key in the
serialized object

#### `toJSONStrategy`

(Optional) `{ToJSONStrategy}` used when serializing values

#### `fromJSONStrategy`

(Optional) `{FromJSONStrategy}` used when deserializing values

```ts
import { Serializable, SerializeProperty } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "SerializeProperty options",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      propertyOne = "Hello";
      @SerializeProperty("property_two")
      propertyTwo = "World!";
      @SerializeProperty({ serializedKey: (key) => `__${key}__` })
      propertyThree = "foo";
    }
    assertEquals(
      new Test().toJSON(),
      `{"propertyOne":"Hello","property_two":"World!","__propertyThree__":"foo"}`,
    );
    const testObj = new Test().fromJSON(
      `{"propertyOne":"From","property_two":"JSON!","__propertyThree__":"bar"}`,
    );
    assertEquals(testObj.propertyOne, "From");
    assertEquals(testObj.propertyTwo, "JSON!");
    assertEquals(
      testObj.toJSON(),
      `{"propertyOne":"From","property_two":"JSON!","__propertyThree__":"bar"}`,
    );
  },
});
```

### Strategies

Strategies are functions or a composed list of functions to execute on the
values when serializing or deserializing. The functions take one argument which
is the value to process.

```ts
import { Serializable, SerializeProperty } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Strategies",
  fn() {
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
  },
});
```

### Multiple strategy functions

`toJSONStrategy` and `fromJSONStrategy` can use `composeStrategy` to build out
strategies with multiple functions.

```ts
import { composeStrategy, Serializable, SerializeProperty } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Multiple strategy functions",
  fn() {
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
  },
});
```

### Dates

Dates can use the `fromJSONStrategy` to revive a serialized string into a Date
object. `ts_serialize` provides a `iso8601Date` function to parse ISO Dates.

```ts
import { iso8601Date, Serializable, SerializeProperty } from "./mod.ts";
import { assert, assertEquals, test } from "./test_deps.ts";

test({
  name: "Dates",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      date!: Date;
    }

    const testObj = new Test().fromJSON(`{"date":"2020-06-04T19:01:47.831Z"}`);
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.getFullYear(), 2020);
  },
});
```

`createDateStrategy()` can be use to make a reviving date strategy. Pass a regex
to make your own.

```ts
import { createDateStrategy, Serializable, SerializeProperty } from "./mod.ts";
import { assert, assertEquals, test } from "./test_deps.ts";

test({
  name: "createDateStrategy",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
      })
      date!: Date;
    }

    const testObj = new Test().fromJSON(`{"date":"2099-11-25"}`);
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.getFullYear(), 2099);
  },
});
```

### Inheritance

Inherited classes override the key when serializing. If you override a property
any value used for that key will be overridden by the child value. _With
collisions the child always overrides the parent_

```ts
import { Serializable, SerializeProperty } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Inheritance",
  fn() {
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
  },
});
```

### Nested Class Serialization

#### ToJSON

Serializing a nested class will follow the serialization rules set from the
class:

```ts
import { Serializable, SerializeProperty } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "ToJSON",
  fn() {
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
    assertEquals(
      testObj.toJSON(),
      `{"serialize_me_2":{"serialize_me_1":"nice1"}}`,
    );
  },
});
```

#### FromJSON

Use a strategie to revive the property into a class. `toSerializable` is a
provided function export that takes one parameter, the instance type the object
will take when revived, it will also revive to an array of Serializable objects.

```ts
import { Serializable, SerializeProperty, toSerializable } from "./mod.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "FromJSON",
  fn() {
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
  },
});
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
import {
  getNewSerializable,
  Serializable,
  SerializeProperty,
  toSerializable,
} from "./mod.ts";
import { assert, assertEquals, test } from "./test_deps.ts";

export function DeserializeAs(
  type: unknown,
): PropertyDecorator {
  return SerializeProperty({
    fromJSONStrategy: toSerializable(() => getNewSerializable(type)),
  });
}

test({
  name: "Custom decorator",
  fn() {
    class A extends Serializable {
      @SerializeProperty("property_a")
      public property = "";
    }

    class B extends Serializable {
      @DeserializeAs(A)
      public property = new A();

      public otherProperty = "";

      constructor({ otherProperty = "" }: Partial<B> = {}) {
        super();
        this.otherProperty = otherProperty;
      }
    }

    class C extends Serializable {
      @DeserializeAs(() => new B({ otherProperty: "From Class C" }))
      public property = new B();
    }

    const testObj = new C().fromJSON({
      property: { property: { property_a: "Class C fromJSON" } },
    });

    assert(testObj.property instanceof B);
    assert(testObj.property.property instanceof A);
    assertEquals(testObj.property.otherProperty, "From Class C");
    assertEquals(testObj.property.property.property, "Class C fromJSON");
  },
});
```

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
import {
  polymorphicClassFromJSON,
  PolymorphicSwitch,
  Serializable,
  SerializeProperty,
} from "./mod.ts";
import { assert, assertEquals, test } from "./test_deps.ts";

enum Colour {
  RED = "RED",
  BLUE = "BLUE",
}

test({
  name: "PolymorphicSwitch",
  fn() {
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

    assert(redClass instanceof MyRedClass);
    assertEquals((redClass as MyRedClass).crimson, true);
  },
});
```

You can also provide a test function instead of a value to check if the value
for the annotated property satisfies a more complex condition:

```ts
import {
  polymorphicClassFromJSON,
  PolymorphicSwitch,
  Serializable,
  SerializeProperty,
} from "./mod.ts";
import { assert, assertEquals, test } from "./test_deps.ts";

test({
  name: "Complex PolymorphicSwitch",
  fn() {
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

    assert(currencyClass instanceof OtherCurrency);
    assertEquals((currencyClass as OtherCurrency).amount, 300);
  },
});
```

Multiple `@PolymorphicSwitch` annotations can be applied to a single class, if
necessary

```ts
import {
  polymorphicClassFromJSON,
  PolymorphicSwitch,
  Serializable,
  SerializeProperty,
} from "./mod.ts";
import { assert, test } from "./test_deps.ts";

test({
  name: "Single class PolymorphicSwitch",
  fn() {
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
    assert(myClass1 instanceof MyClass);
    const myClass2 = polymorphicClassFromJSON(
      MyAbstractClass,
      `{"myProperty":"dollar"}`,
    );
    assert(myClass2 instanceof MyClass);
  },
});
```

### Polymorphic Resolver

The following example shows how the `@PolymorphicResolver` decorator can be used
to directly determine the type of an abstract class implementor, which will then
be used when deserializing JSON input.

```ts
import {
  polymorphicClassFromJSON,
  PolymorphicResolver,
  Serializable,
  SerializeProperty,
} from "./mod.ts";
import { assert, assertEquals, test } from "./test_deps.ts";

enum Colour {
  RED = "RED",
  BLUE = "BLUE",
}

test({
  name: "PolymorphicResolver",
  fn() {
    abstract class MyColourClass extends Serializable {
      @SerializeProperty()
      public colour?: Colour;

      @PolymorphicResolver()
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
    class PolymorphicColourClass extends MyColourClass {}

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

    // Serialize using PolymorphicColourClass to determine the value of `colour`
    // then serialize using `MyRedClass`
    const redClass = polymorphicClassFromJSON(
      MyColourClass,
      `{"colour":"RED","crimson":true}`,
    );

    assert(redClass instanceof MyRedClass);
    assertEquals((redClass as MyRedClass).isCrimson(), true);
  },
});
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
