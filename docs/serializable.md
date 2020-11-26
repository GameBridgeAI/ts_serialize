## Serializable and SerializeProperty

Import `Serializable` and `SerializeProperty`, extend `Serializable` from your `class`
and use the `SerializeProperty` decorator on any properties you want serialized.

```ts
class Test extends Serializable {
  @SerializeProperty()
  propertyOne = "Hello";
  @SerializeProperty()
  propertyTwo = "World!";
  notSerialized = "not-serialized";
}

assertEquals(
  new Test().toJSON(),
  `{"propertyOne":"Hello","propertyTwo":"World!"}`
);
const testObj = new Test().fromJSON(
  `{"propertyOne":"From","propertyTwo":"JSON!","notSerialized":"changed"}`
);
assertEquals(testObj.propertyOne, "From");
assertEquals(testObj.propertyTwo, "JSON!");
assertEquals(testObj.notSerialized, "changed");
assertEquals(testObj.toJSON(), `{"propertyOne":"From","propertyTwo":"JSON!"}`);
```
### Inheritance

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
assertEquals(testObj.toJSON(), `{"serialize_me":"nice2"}`);
```

### Nested Class Serialization

**ToJSON**

Serializing a nested class will follow the serialization rules set from the class:

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

Use a [strategy](./strategies) to revive the property into a class. `as` is 
a provided function export that takes one parameter, the instance type the object 
will take when revived.

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

### SerializeProperty options

Passing a string or a function as an argument to `SerializeProperty` causes the property to use
that name as the key when serialized. The function has one parameter, the `key` as string and 
should return a string.

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

- `serializedKey` (Optional) `{string | ToSerializedKeyStrategy}` - Used as the key in the serialized object
- `toJSONStrategy` (Optional) `{ToJSONStrategy}` - Used when serializing
- `fromJSONStrategy` (Optional) `{FromJSONStrategy}` - Used when deserializing

For example the class in the above code block could also be written as:

```ts
class Test extends Serializable {
  @SerializeProperty()
  propertyOne = "Hello";
  @SerializeProperty("property_two")
  propertyTwo = "World!";
  @SerializeProperty({ serializedKey: (key) => `__${key}__`})
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

[Strategies](./strategies) are ways to convert data to and from a JSON value.