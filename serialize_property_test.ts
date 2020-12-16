// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  assert,
  assertEquals,
  assertStrictEquals,
  fail,
  test,
} from "./test_deps.ts";
import { Serializable } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";
import {
  ERROR_DUPLICATE_SERIALIZE_KEY,
  ERROR_SYMBOL_PROPERTY_NAME,
} from "./error_messages.ts";

test({
  name: "Serializes properties as propertyName without options",
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

test({
  name: "Serializes properties with a string name",
  fn() {
    class Test extends Serializable {
      @SerializeProperty("test_name")
      testName = "toJSON";
    }
    assertEquals(new Test().toJSON(), `{"test_name":"toJSON"}`);
    const testObj = new Test().fromJSON({ test_name: "fromJSON" });
    assertEquals(testObj.testName, "fromJSON");
  },
});

test({
  name: "Serializes properties with a string name option",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({ serializedKey: "test_name" })
      testName = "toJSON";
    }
    assertEquals(new Test().toJSON(), `{"test_name":"toJSON"}`);
    const testObj = new Test().fromJSON(`{"test_name":"fromJSON"}`);
    assertEquals(testObj.testName, "fromJSON");
  },
});

test({
  name: "Errors on Symbol named properties",
  fn() {
    try {
      const TEST = Symbol("test");
      class Test extends Serializable {
        @SerializeProperty()
        [TEST] = "toJSON";
      }
      fail("Allowed Symbol name without propertyName");
    } catch (e) {
      assertEquals(e.message, ERROR_SYMBOL_PROPERTY_NAME);
    }
  },
});

test({
  name: "Allows Symbol named properties with a string option name",
  fn() {
    const TEST = Symbol("test");
    const TEST2 = Symbol("test");
    class Test extends Serializable {
      @SerializeProperty("test_name")
      [TEST] = "toJSON";
      @SerializeProperty({ serializedKey: "test_name2" })
      [TEST2] = "toJSON2";
    }
    assertEquals(
      new Test().toJSON(),
      `{"test_name":"toJSON","test_name2":"toJSON2"}`,
    );
    const testObj = new Test().fromJSON(
      `{"test_name":"fromJSON","test_name2":"fromJSON2"}`,
    );
    assertEquals(testObj[TEST], "fromJSON");
    assertEquals(testObj[TEST2], "fromJSON2");
  },
});

test({
  name: "Uses a provided fromJSONStrategy",
  fn() {
    const change = () => `hello world`;
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: change,
      })
      change!: string;
    }
    const testObj = new Test().fromJSON(`{"change":"hi earth"}`);
    assertEquals(testObj.change, "hello world");
  },
});

test({
  name: "Uses a provided replacer strategy",
  fn() {
    const change = () => `hello world`;
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: change,
      })
      change!: string;
    }
    const testObj = new Test().fromJSON(`{"change":"hi earth"}`);
    assertEquals(testObj.change, "hello world");
  },
});

test({
  name: "Preserves string type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      test!: string;
    }
    assertEquals(
      typeof new Test().fromJSON(`{"test":"string"}`).test,
      "string",
    );
  },
});

test({
  name: "Preserves number type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      zero!: number;
      @SerializeProperty()
      one!: number;
    }
    const testObj = new Test().fromJSON(`{"zero":0,"one":1}`);
    assertEquals(typeof testObj.zero, "number");
    assertEquals(typeof testObj.one, "number");
  },
});

test({
  name: "Preserves boolean type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      true!: boolean;
      @SerializeProperty()
      false!: boolean;
    }
    const testObj = new Test().fromJSON(`{"true":true,"false":false}`);
    assertEquals(typeof testObj.true, "boolean");
    assertEquals(typeof testObj.false, "boolean");
  },
});

test({
  name: "Preserves null type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      null!: null;
    }
    const testObj = new Test().fromJSON(`{"null":null}`);
    assertStrictEquals(testObj.null, null);
  },
});

test({
  name: "Preserves object type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      object!: Record<string | symbol, unknown>;
    }
    const testObj = new Test().fromJSON(`{"object":{"test":"worked"}}`);
    assertEquals(testObj.object.test, "worked");
  },
});

test({
  name: "Preserves array type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      array!: any[];
    }
    const testObj = new Test().fromJSON(
      `{"array":["worked",0,{"subObj":["cool"]}]}`,
    );
    assert(Array.isArray(testObj.array));
    assertEquals(testObj.array.length, 3);
    assert(Array.isArray(testObj.array[2].subObj));
    assertEquals(typeof testObj.array[1], "number");
  },
});

test({
  name: "Revives an array of `type`",
  fn() {
    class OtherClass extends Serializable {
      @SerializeProperty()
      id!: number;
    }
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: (v) => new OtherClass().fromJSON(v),
      })
      array!: OtherClass[];
    }
    const testObj = new Test().fromJSON(
      `{"array":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}]}`,
    );
    assertEquals(testObj.array.length, 5);
    assert(testObj.array[0] instanceof OtherClass);
    assertEquals(testObj.array[4].id, 5);
  },
});

test({
  name: "Will not serialize properties that are not decorated",
  fn() {
    class Test extends Serializable {
      @SerializeProperty("serialize_me")
      serializeMe = "nice";
      dontSerializeMe = "great";
    }
    const testObj = new Test();
    assertEquals(testObj.serializeMe, "nice");
    assertEquals(testObj.dontSerializeMe, "great");
    assertEquals(testObj.toJSON(), `{"serialize_me":"nice"}`);
  },
});

test({
  name: "Errors on duplicate map keys",
  fn() {
    try {
      class Test extends Serializable {
        @SerializeProperty("serialize_me")
        serializeMe = "nice";
        @SerializeProperty("serialize_me")
        serializeMeToo = "great";
      }
      fail("Allowed duplicate propertyName");
    } catch (e) {
      assertEquals(
        e.message,
        `${ERROR_DUPLICATE_SERIALIZE_KEY}: serialize_me`,
      );
    }
  },
});

test({
  name: "Inherited class key override serialize",
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

test({
  name: "Inherited class key override deserialize",
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
    testObj.fromJSON(`{"serialize_me":"override"}`);

    assertEquals(testObj.serializeMe, "nice1");
    assertEquals(testObj.serializeMeInstead, "override");
  },
});

test({
  name: "Inherited serialize key override serialize",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Test1 {
      @SerializeProperty("serialize_me_2")
      serializeMe = "nice2";
    }
    const testObj = new Test2();
    assertEquals(testObj.serializeMe, "nice2");
    assertEquals(testObj.toJSON(), `{"serialize_me_2":"nice2"}`);
  },
});

test({
  name: "Inherited serialize key override deserialize",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Test1 {
      @SerializeProperty("serialize_me_2")
      serializeMe = "nice2";
    }
    const testObj = new Test2();

    testObj.fromJSON(
      `{"serialize_me_1":"ignore me", "serialize_me_2":"override"}`,
    );
    assertEquals(testObj.serializeMe, "override");
  },
});

test({
  name: "deserialize nested",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Serializable {
      @SerializeProperty({
        serializedKey: "serialize_me_2",
        fromJSONStrategy: (json) => new Test1().fromJSON(json),
      })
      nested!: Test1;
    }
    const testObj = new Test2();

    testObj.fromJSON({ "serialize_me_2": { "serialize_me_1": "pass" } });
    assertEquals(testObj.nested.serializeMe, "pass");
  },
});

test({
  name: "Serialize nested",
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

test({
  name: "Serialize arrays of nested objects",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      serializeMe = 999;
    }
    class Test2 extends Serializable {
      @SerializeProperty({
        serializedKey: "outer_property",
      })
      nested: Test1[] = [new Test1()];
    }

    class Test3 extends Serializable {
      @SerializeProperty({
        serializedKey: "outer_outer_property",
      })
      nested2: Test2[] = [new Test2()];
    }
    const testObj = new Test3();

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":[{"outer_property":[{"nested_property":999}]}]}`,
    );
  },
});

test({
  name: "Serialize key function",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty((propertyName) => `_${String(propertyName)}`)
      serializeMe = "nice1";
    }
    const testObj = new Test1();
    assertEquals(
      testObj.toJSON(),
      `{"_serializeMe":"nice1"}`,
    );
  },
});

test({
  name: "Deserialize key function",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty((propertyName) => `_${String(propertyName)}`)
      serializeMe = "nice1";
    }
    assertEquals(
      new Test1().fromJSON({ "_serializeMe": "nice2" }).serializeMe,
      "nice2",
    );
  },
});

test({
  name: "Serialize key function object",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty(
        ({ serializedKey: (propertyName) => `_${String(propertyName)}` }),
      )
      serializeMe = "nice1";
    }
    const testObj = new Test1();
    assertEquals(
      testObj.toJSON(),
      `{"_serializeMe":"nice1"}`,
    );
  },
});

test({
  name: "Deserialize key function object",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty(
        { serializedKey: (propertyName) => `_${String(propertyName)}` },
      )
      serializeMe = "nice1";
    }
    assertEquals(
      new Test1().fromJSON({ "_serializeMe": "nice2" }).serializeMe,
      "nice2",
    );
  },
});

test({
  name: "should be able to serialize a serializable without any properties",
  fn() {
    class TestSerializable extends Serializable {}

    assertEquals(new TestSerializable().fromJSON({}), {});
    const serializedClass = new TestSerializable().fromJSON({});
    assertEquals(Object.keys(serializedClass).length, 0);
  },
});

test({
  name:
    "should be able to serialize child class and have it inherit it's parent's serialization logic correctly",
  fn() {
    class TestSerializable extends Serializable {
      @SerializeProperty()
      public test_property = 1;
    }
    class TestSerializableChild extends TestSerializable {}
    // Parent
    assertEquals(
      new TestSerializable().toJSON(),
      `{"test_property":1}`,
    );
    assertEquals(
      new TestSerializable().fromJSON(`{"test_property":32}`)
        .test_property,
      32,
    );
    // Child
    assertEquals(
      new TestSerializableChild().toJSON(),
      `{"test_property":1}`,
    );
    assertEquals(
      new TestSerializableChild().fromJSON(`{"test_property":32}`)
        .test_property,
      32,
    );
  },
});

test({
  name:
    "should be able to serialize grandchild class and have it inherit it's grandparent's serialization logic correctly",
  fn() {
    class TestSerializable extends Serializable {
      @SerializeProperty()
      public test_property = 0;
    }
    class TestSerializableChild extends TestSerializable {}
    class TestSerializableGrandChild extends TestSerializableChild {}

    // Grandchild
    assertEquals(
      new TestSerializableGrandChild().toJSON(),
      `{"test_property":0}`,
    );
    assertEquals(
      new TestSerializableGrandChild().fromJSON(`{"test_property":33}`)
        .test_property,
      33,
    );
  },
});
