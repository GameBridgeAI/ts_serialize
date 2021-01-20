# 🥣 ts_serialize 

[![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg) 
[![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg) 
[![github doc](https://img.shields.io/badge/github-doc-5279AA.svg)](https://gamebridgeai.github.io/ts_serialize)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/ts_serialize/mod.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Home](./index)

## Polymorphism

The `@PolymorphicResolver` and `@PolymorphicSwitch` decorators can be used
to cleanly handle deserializing abstract types into their constituent 
implementations.

### Polymorphic Resolver

The following example shows how the `@PolymorphicResolver` decorator can be
used to directly determine the type of an abstract class implementor, 
which will then be used when deserializing JSON input.

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

### Polymorphic Switch Resolver

The `@PolymorphicSwitch` decorator can be used as a quick way to serialize
simple polymorphic types based on the properties of a child class. 
Unlike the `@PolymorphicResolver` decorator all implementors should have
to do is annotate an existing property and provide an initializer.

Note that currently `@PolymorphicSwitch` can only be applied to child
classes deserializing from their direct parent class.

```ts
enum Colour {
  RED = "RED",
  BLUE = "BLUE",
}

abstract class MyColourClass extends Serializable {
  @SerializeProperty()
  public colour?: Colour;
}

class MyRedClass extends MyColourClass {
  // Note that this static property is NOT part of serialization
  // colour will be set by MyColourClass#colour's `@SerializeProperty` annotation
  @PolymorphicSwitch(() => new MyRedClass())
  private static colour = Colour.RED;

  @SerializeProperty()
  private crimson = false;

  public isCrimson(): boolean {
    return this.crimson;
  }
}

class MyBlueClass extends MyColourClass {
  @PolymorphicSwitch(() => new MyBlueClass())
  private static colour = Colour.BLUE;

  @SerializeProperty()
  private aqua = false;

  public isAqua(): boolean {
    return this.aqua;
  }
}

// Serialize using JSON.parse, read `colour` off of the parsed object
// then parse using the value provided in `@PolymorphicSwitch`
const redClass = polymorphicClassFromJSON(
  MyColourClass,
  `{"colour":"RED","crimson":true}`,
);

console.log(`Is a red class? ${redClass instanceof MyRedClass}`);
// > Is a red class? true
console.log(`Is crimson? ${(redClass as MyRedClass).isCrimson()}`);
// > Is crimson? true
```

`@PolymorphicSwitch` is also useful on more complex polymorphic types that 
may not have a simple one to one property value to implementation mapping

```ts
abstract class MyColourClass extends Serializable {}

class MyRedClass extends MyColourClass {
  @PolymorphicSwitch(() => new MyRedClass(), true)
  @PolymorphicSwitch(() => new MyRedClass(), false)
  @SerializeProperty()
  private crimson = false;

  public isCrimson(): boolean {
    return this.crimson;
  }
}

class MyBlueClass extends MyColourClass {
  @PolymorphicSwitch(() => new MyBlueClass(), true)
  @PolymorphicSwitch(() => new MyBlueClass(), false)
  @SerializeProperty()
  private aqua = false;

  public isAqua(): boolean {
    return this.aqua;
  }
}

// Serialize using JSON.parse, read `crimson` off of the parsed object, then parse using the value provided in `@PolymorphicSwitch`
const redClass = polymorphicClassFromJSON(MyColourClass, `{"crimson":true}`);

console.log(`Is a red class? ${redClass instanceof MyRedClass}`);
// > Is a red class? true
console.log(`Is crimson? ${(redClass as MyRedClass).isCrimson()}`);
// > Is crimson? true
```

In the case a class has a property that contains a polymorphic value, a `FromJSONStrategy`
that uses `polymorphicClassFromJSON` can be used to deserialize to the correct class.

```ts
abstract class PolymorphicBase extends Serializable {}

class TypeOne extends PolymorphicBase {
  @PolymorphicSwitch(() => new TypeOne(), 1)
  @SerializeProperty()
  private _type = 1;
}

class TypeTwo extends PolymorphicBase {
  @PolymorphicSwitch(() => new TypeTwo(), 2)
  @SerializeProperty()
  private _type = 2;
}

class WithPolymorphic extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: json => polymorphicClassFromJSON(MyColourClass, json),
  })
  public property: PolymorphicBase;
}

const polymorphic = new WithPolymorphic().fromJSON({ type: 2 });

console.log(polymorphic.property instanceof TypeTwo) // true
```