# 🥣 ts_serialize

[![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)
[![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)
[![github doc](https://img.shields.io/badge/github-doc-5279AA.svg)](https://gamebridgeai.github.io/ts_serialize)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/ts_serialize/mod.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Home](./index)

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
