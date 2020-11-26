## Global transformKey

`Serializable` has an optional function `tsTransformKey(key: string): string`, we also
provide an interface `TransformKey` to implement for type safety. This function
can be provided to change all the keys without having to specify the change for each property.

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
  `changed`
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
  `{"__test2__":"test2","__test3__":"test3"}`
);
assertEquals(
  new TestTransformKey3().fromJSON({ __test3__: "changed" }).test3,
  `changed`
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
  `{"__test2__":"test2","--test3--":"test3","--test4--":"test4"}`
);
assertEquals(
  new TestTransformKey4().fromJSON({ "--test4--": "changed" }).test4,
  `changed`
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
  `{"__test2__":"test2","changed":"change me","changed2":"change me2"}`
);
assertEquals(
  new TestTransformKey2().fromJSON({ changed: "changed" }).changeMe,
  `changed`
);
assertEquals(
  new TestTransformKey2().fromJSON({ changed2: "changed" }).changeMe2,
  `changed`
);
```

`tsTransformKey` is an efficient way to deal with
camelCase to snake_case conversions.