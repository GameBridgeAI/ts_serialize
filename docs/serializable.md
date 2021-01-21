# 🥣 ts_serialize

[![tests](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/tests/badge.svg)
[![release](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)](https://github.com/GameBridgeAI/ts_serialize/workflows/release/badge.svg)
[![github doc](https://img.shields.io/badge/github-doc-5279AA.svg)](https://gamebridgeai.github.io/ts_serialize)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/ts_serialize/mod.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Home](./index)

## Serializable and SerializeProperty

Import `Serializable` and `SerializeProperty`, extend `Serializable` from your
`class` and use the `SerializeProperty` decorator on any properties you want
serialized.

`Serializable` will add three methods `toJSON`, `fromJSON`, and `tsSerialize`.

- `fromJSON` - takes one argument, the JSON string or `Object` to deserialize
- `toJSON` - converts the model to a JSON string
- `tsSerialize` - converts the model to "Plain old Javascript object" with any
  provided key or value transformations

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
assertEquals(testObj.toJSON(), `{"test":99,"test_one":100}`);
assertEquals(new TestClass().fromJSON({ test: 88 }).test, 88);
assertEquals(testObj.tsSerialize(), { test: 99, test_one: 100 });
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

### SerializeProperty options

Passing a string or a function as an argument to `SerializeProperty` causes the
property to use that name as the key when serialized. The function has one
parameter, the `key` as string and should return a string.

```ts
class Test extends Serializable {
  @SerializeProperty()
  propertyOne = "Hello";
  @SerializeProperty("property_two")
  propertyTwo = "World!";
  @SerializeProperty((key) => `__${key}__`)
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

`SerializeProperty` also excepts an options object with the properties:

- `serializedKey` (Optional) `{string | ToSerializedKeyStrategy}` - Used as the
  key in the serialized object
- `toJSONStrategy` (Optional) `{ToJSONStrategy}` - Used when serializing
- `fromJSONStrategy` (Optional) `{FromJSONStrategy}` - Used when deserializing

For example the class in the above code block could also be written as:

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

## Short cutting the `@SerializeProperty` decorator

While `@SerializeProperty` is handy with to and from JSON strategies, it can
still be verbose to declare the strategies for each property. You can define your own
decorator functions to wrap `@SerializeProperty` and provide the `toJSONStrategy`
and `fromJSONStrategy`. An example short cut is providing a `type` to use with
`toSerializable`:

```ts
export function DeserializeAs<T>(
  type: StrategyTypeArgument<T>,
): PropertyDecorator {
  return SerializeProperty({ fromJSONStrategy: toSerializable(type) });
}

class A extends Serializable {
  @SerializeProperty("property_a")
  public propertyA: string;
}

class B extends Serializable {
  @DeserializeAs(A)
  public property: A;
}
```

While this is a simple example these functions can be as complex as you would
like.

[Strategies](./strategies) are ways to convert data to and from a JSON value.
