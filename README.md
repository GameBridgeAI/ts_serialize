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

Supported Serialized Types:

- [`JSON`](https://www.json.org/json-en.html)

## Isntalling

`ts_serialize` supports both `deno` and `node`.

### Deno

`export` what you need from `https://deno.land/x/ts_serialize/mod.ts`

> The examples in this README pull from our `develop` branch. You would want to
> "pin" to a particular version which is compatible with the version of Deno you
> are using and has a fixed set of APIs you would expect. `https://deno.land/x/`
> supports using git tags in the URL to direct you at a particular version. So
> to use version 2.0.0 of `ts_serialize` you would want to import
> `https://deno.land/x/ts_serialize@v2.0.0/mod.ts`.

### Node

Install with `npm i @gamebridgeai/ts_serialize` or
`yarn add @gamebridgeai/ts_serialize`

## Using `Serializable` and `SerializeProperty()`

To quickly get started extend `Serializable` with your class and add the
[property decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#property-decorators)
`SerializeProperty()` to any class property you want in the serialization
process.

```typescript
import { Serializable, SerializeProperty } from "./mod.ts";

class MyClass extends Serializable {
  @SerializeProperty()
  public myProperty = "Hello world!";
}
```

### Serializable Methods

`Serializable` will add 5 methods. Each method has an implementable interface if
you wish to provide your own functionality.

- `fromJSON`

  Takes one argument, the JSON `string` or `JSONObject` to deserialize creating
  an object. `fromJSON` will perform provided `tsTransformKey` operations and
  strategy value transformations.

- `toJSON`

  Converts the model to a JSON `string` and will perform provided
  `tsTransformKey` operations and strategy value transformations.

- `clone`

  Returns a new reference of the object with all properties cloned, an optional
  parameter can be provided which is a `Partial<T>` where `T` is your class.

- `tsSerialize`

  Converts the model to "Plain old Javascript object" with any provided
  `tsTransformKey` or value transformations

- `tsTransformKey`

  Called against every key and has one parameter, the key to transform. The
  return value is a string. The default is to return the original parameter
  name. Key transformations will be inherited by children classes. Children
  classes can also `override` their parent `tsTransformKey` function.

With this in mind we can write a more complex example. We'll make a `base` class
that provides a key transformation then add child classes.

```typescript
import { Serializable, SerializeProperty, TransformKey } from "./mod.ts";

abstract class Base extends Serializable implements TransformKey {
  public tsTransformKey(key: string): string {
    return `__${key}__`;
  }
}

class Parent extends Base {
  @SerializeProperty()
  public parentProperty = "Hello world!";
}

class ChildOne extends Parent {
  @SerializeProperty()
  public childOneProperty = "Ahoy hoy world!";
}

class ChildTwo extends Parent implements TransformKey {
  @SerializeProperty()
  public childTwoProperty = "Good Day world!";

  @SerializeProperty("myCustomName")
  public childTwoPropertyTwo = "Howdy world!";

  public tsTransformKey(key: string): string {
    return `--${key}--`;
  }
}
```

Passing a string or a function that returns a string as an argument to
`SerializeProperty()` causes the property to use that name as the key when
serialized. The function has one parameter, the `key` as string and should
return a string.

> Inherited classes override the key when serializing. If you override a
> property any value used for that key will be overridden by the child value.
> _With collisions the child always overrides the parent_

### `SerializeProperty()` options

`SerializeProperty()` also excepts an optional options object with the
properties

- `serializedKey`

  (Optional) `{string | ToSerializedKeyStrategy}` A string value or function
  that has one parameter, the property key, and returns a string. The resulting
  value is used as the key in the serialized object

- `toJSONStrategy`

  (Optional) `{ToJSONStrategy}` A function that has one parameter, the class
  property value and returns a value to be used when serialized as `JSON`

- `fromJSONStrategy`

  (Optional) `{FromJSONStrategy}` A function that has one parameter, the `JSON`
  property value and returns a value to be used when serialized as a class

### Strategies

Strategies are functions or a composed list of functions to execute on the
values when serializing or deserializing. The functions take one argument which
is the value to process.

```typescript
import { Serializable, SerializeProperty } from "./mod.ts";

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
```

`toJSONStrategy` and `fromJSONStrategy` can use `composeStrategy` to build out
strategies with multiple functions.

```typescript
import { composeStrategy, Serializable, SerializeProperty } from "./mod.ts";

const addWord = (word: string) => (v: string) => `${v} ${word}`;
const shout = (v: string) => `${v}!!!`;

class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: composeStrategy(addWord("World"), shout),
  })
  property!: string;
}
```

### Dates

Dates can use the `fromJSONStrategy` to revive a serialized string into a Date
object. `ts_serialize` provides a `iso8601Date` function to parse ISO Dates.

```typescript
import { iso8601Date, Serializable, SerializeProperty } from "./mod.ts";

class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: iso8601Date(),
  })
  date!: Date;
}
```

`createDateStrategy()` can be use to make a reviving date strategy. Pass a regex
to make your own. The example below uses a `yyyy-mm-dd` format to construct a
`Date`

```typescript
import { createDateStrategy, Serializable, SerializeProperty } from "./mod.ts";
class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
  })
  date!: Date;
}
```

## Short cutting the `@SerializeProperty` decorator

While `@SerializeProperty` is handy with to and from JSON strategies, it can
still be verbose to declare the strategies for each property. You can define
your owndecorator functions to wrap `@SerializeProperty` and provide the
`toJSONStrategy` and `fromJSONStrategy`. An example short cut is providing a
`type` to use with `toSerializable`. `getNewSerializable` is provided to allow a
raw serializable type or a function that returns a constructed serializable type
enabling constructor arguments:

```typescript
import {
  getNewSerializable,
  Serializable,
  SerializeProperty,
  toSerializable,
} from "./mod.ts";

function DeserializeAs(
  type: unknown,
): PropertyDecorator {
  return SerializeProperty({
    fromJSONStrategy: toSerializable(() => getNewSerializable(type)),
  });
}

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

```typescript
import {
  polymorphicClassFromJSON,
  PolymorphicSwitch,
  Serializable,
  SerializeProperty,
} from "./mod.ts";

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

const redClass = polymorphicClassFromJSON(
  MyColourClass,
  `{"colour":"RED","crimson":true}`,
);
```

You can also provide a test function instead of a value to check if the value
for the annotated property satisfies a more complex condition:

```typescript
import {
  polymorphicClassFromJSON,
  PolymorphicSwitch,
  Serializable,
  SerializeProperty,
} from "./mod.ts";

abstract class Currency extends Serializable {}

class DollarCurrency extends Currency {
  @SerializeProperty()
  @PolymorphicSwitch(() => new DollarCurrency(), "$")
  public currencySymbol = "$";

  @SerializeProperty()
  public amount = 0;
}

class OtherCurrency extends Currency {
  @SerializeProperty()
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
```

Multiple `@PolymorphicSwitch` annotations can be applied to a single class, if
necessary

```typescript
import {
  polymorphicClassFromJSON,
  PolymorphicSwitch,
  Serializable,
  SerializeProperty,
} from "./mod.ts";

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

const myClass2 = polymorphicClassFromJSON(
  MyAbstractClass,
  `{"myProperty":"dollar"}`,
);
```

### Polymorphic Resolver

The following example shows how the `@PolymorphicResolver` decorator can be used
to directly determine the type of an abstract class implementor, which will then
be used when deserializing JSON input.

```typescript
import {
  polymorphicClassFromJSON,
  PolymorphicResolver,
  Serializable,
  SerializeProperty,
} from "./mod.ts";

enum Colour {
  RED = "RED",
  BLUE = "BLUE",
}

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

const redClass = polymorphicClassFromJSON(
  MyColourClass,
  `{"colour":"RED","crimson":true}`,
);
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
