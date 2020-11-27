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
    const colourClass = new PolymorphicColourClass().fromJson(input);

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

// Serialize using JSON.parse, read `colour` off of the parsed object, then parse using the value provided in `@PolymorphicSwitch`
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
  @SerializeProperty()
  @PolymorphicSwitch(() => new MyRedClass(), true)
  @PolymorphicSwitch(() => new MyRedClass(), false)
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