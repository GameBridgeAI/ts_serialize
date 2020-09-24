// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  test,
  assert,
  assertEquals,
  assertStrictEquals,
  fail,
} from "./test_deps.ts";
import { Serializable } from "./serializable.ts";
import {
  SerializeProperty,
  ERROR_MESSAGE_SYMBOL_PROPERTY_NAME,
} from "./serialize_property.ts";
import { ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY } from "./serialize_property_options_map.ts";

test({
  name: "Serializes properties as propertyName without options",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      testName = "toJson";
    }
    assertEquals(new Test().toJson(), `{"testName":"toJson"}`);
    const testObj = new Test().fromJson(`{"testName":"fromJson"}`);
    assertEquals(testObj.testName, "fromJson");
  },
});

test({
  name: "Serializes properties with a string name",
  fn() {
    class Test extends Serializable {
      @SerializeProperty("test_name")
      testName = "toJson";
    }
    assertEquals(new Test().toJson(), `{"test_name":"toJson"}`);
    const testObj = new Test().fromJson({ testName: "fromJson" });
    assertEquals(testObj.testName, "fromJson");
  },
});

test({
  name: "Serializes properties with a string name option",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({ serializedKey: "test_name" })
      testName = "toJson";
    }
    assertEquals(new Test().toJson(), `{"test_name":"toJson"}`);
    const testObj = new Test().fromJson(`{"test_name":"fromJson"}`);
    assertEquals(testObj.testName, "fromJson");
  },
});

test({
  name: "Errors on Symbol named properties",
  fn() {
    try {
      const TEST = Symbol("test");
      class Test extends Serializable {
        @SerializeProperty()
        [TEST] = "toJson";
      }
      fail("Allowed Symbol name without propertyName");
    } catch (e) {
      assertEquals(e.message, ERROR_MESSAGE_SYMBOL_PROPERTY_NAME);
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
      [TEST] = "toJson";
      @SerializeProperty({ serializedKey: "test_name2" })
      [TEST2] = "toJson2";
    }
    assertEquals(
      new Test().toJson(),
      `{"test_name":"toJson","test_name2":"toJson2"}`,
    );
    const testObj = new Test().fromJson(
      `{"test_name":"fromJson","test_name2":"fromJson2"}`,
    );
    assertEquals(testObj[TEST], "fromJson");
    assertEquals(testObj[TEST2], "fromJson2");
  },
});

test({
  name: "Uses a provided fromJsonStrategy",
  fn() {
    const change = () => `hello world`;
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: change,
      })
      change!: string;
    }
    const testObj = new Test().fromJson(`{"change":"hi earth"}`);
    assertEquals(testObj.change, "hello world");
  },
});

test({
  name: "Uses a provided replacer strategy",
  fn() {
    const change = () => `hello world`;
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: change,
      })
      change!: string;
    }
    const testObj = new Test().fromJson(`{"change":"hi earth"}`);
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
      typeof new Test().fromJson(`{"test":"string"}`).test,
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
    const testObj = new Test().fromJson(`{"zero":0,"one":1}`);
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
    const testObj = new Test().fromJson(`{"true":true,"false":false}`);
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
    const testObj = new Test().fromJson(`{"null":null}`);
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
    const testObj = new Test().fromJson(`{"object":{"test":"worked"}}`);
    assertEquals(testObj.object.test, "worked");
  },
});

test({
  name: "Preserves array type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      array!: unknown[];
    }
    const testObj = new Test().fromJson(
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
        fromJsonStrategy: (v: OtherClass) => new OtherClass().fromJson(v),
      })
      array!: OtherClass[];
    }
    const testObj = new Test().fromJson(
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
    assertEquals(testObj.toJson(), `{"serialize_me":"nice"}`);
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
        `${ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY}: serialize_me`,
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
    assertEquals(testObj.toJson(), `{"serialize_me":"nice2"}`);
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
    testObj.fromJson(`{"serialize_me":"override"}`);

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
    assertEquals(testObj.toJson(), `{"serialize_me_2":"nice2"}`);
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

    testObj.fromJson(
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
        fromJsonStrategy: (json) => new Test1().fromJson(json),
      })
      nested!: Test1;
    }
    const testObj = new Test2();

    testObj.fromJson({ "serialize_me_2": { "serialize_me_1": "pass" } });
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
      testObj.toJson(),
      `{"serialize_me_2":{"serialize_me_1":"nice1"}}`,
    );
  },
});

test({
  name: "Serialize key function",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty(
        (
          (propertyName) => "_" + (propertyName as string)
        ),
      )
      serializeMe = "nice1";
    }
    const testObj = new Test1();
    assertEquals(
      testObj.toJson(),
      `{"_serializeMe":"nice1"}`,
    );
  },
});

test({
  name: "Deserialize key function",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty(
        (
          (propertyName) => "_" + (propertyName as string)
        ),
      )
      serializeMe = "nice1";
    }
    assertEquals(
      new Test1().fromJson(JSON.parse(`{"_serializeMe":"nice2"}`)).serializeMe,
      `nice2`,
    );
  },
});

test({
  name: "Serialize key function object",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty(
        ({ serializedKey: (propertyName) => "_" + (propertyName as string) }),
      )
      serializeMe = "nice1";
    }
    const testObj = new Test1();
    assertEquals(
      testObj.toJson(),
      `{"_serializeMe":"nice1"}`,
    );
  },
});
test({
  name: "Deserialize key function object",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty(
        ({ serializedKey: (propertyName) => "_" + (propertyName as string) }),
      )
      serializeMe = "nice1";
    }
    assertEquals(
      new Test1().fromJson(JSON.parse(`{"_serializeMe":"nice2"}`)).serializeMe,
      `nice2`,
    );
  },
});
