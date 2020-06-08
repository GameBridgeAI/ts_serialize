// Copyright 2018-2020 ts_serialize authors. All rights reserved. MIT license.

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
  SYMBOL_PROPERTY_NAME_ERROR_MESSAGE,
} from "./serialize_property.ts";
import { composeReviveStrategy } from "./mod.ts";
import { DUPLICATE_SERIALIZE_KEY_ERROR_MESSAGE } from "./serialize_property_options_map.ts";

test({
  name: "Serializes properties as propertyName without options",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      testName = "toJson";
    }
    assertEquals(new Test().toJson(), `{"testName":"toJson"}`);
    const test = new Test().fromJson(`{"testName":"fromJson"}`);
    assertEquals(test.testName, "fromJson");
  },
});

test({
  name: "Serializes properties with a string name",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty("test_name")
      testName = "toJson";
    }
    assertEquals(new Test().toJson(), `{"test_name":"toJson"}`);
    const test = new Test().fromJson({ testName: "fromJson" });
    assertEquals(test.testName, "fromJson");
  },
});

test({
  name: "Serializes properties with a string name option",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty({ serializedKey: "test_name" })
      testName = "toJson";
    }
    assertEquals(new Test().toJson(), `{"test_name":"toJson"}`);
    const test = new Test().fromJson(`{"test_name":"fromJson"}`);
    assertEquals(test.testName, "fromJson");
  },
});

test({
  name: "Errors on Symbol named properties",
  fn() {
    try {
      const TEST = Symbol("test");
      class Test extends Serializable<Test> {
        @SerializeProperty()
        [TEST] = "toJson";
      }
      fail("Allowed Symbol name without propertyName");
    } catch (e) {
      assertEquals(e.message, SYMBOL_PROPERTY_NAME_ERROR_MESSAGE);
    }
  },
});

test({
  name: "Allows Symbol named properties with a string option name",
  fn() {
    const TEST = Symbol("test");
    const TEST2 = Symbol("test");
    class Test extends Serializable<Test> {
      @SerializeProperty("test_name")
      [TEST] = "toJson";
      @SerializeProperty({ serializedKey: "test_name2" })
      [TEST2] = "toJson2";
    }
    assertEquals(
      new Test().toJson(),
      `{"test_name":"toJson","test_name2":"toJson2"}`
    );
    const test = new Test().fromJson(
      `{"test_name":"fromJson","test_name2":"fromJson2"}`
    );
    assertEquals(test[TEST], "fromJson");
    assertEquals(test[TEST2], "fromJson2");
  },
});

test({
  name: "Uses a provided reviverStrategy",
  fn() {
    const change = (v: string) => `hello world`;
    class Test extends Serializable<Test> {
      @SerializeProperty({
        reviveStrategy: change,
      })
      change!: string;
    }
    const test = new Test().fromJson(`{"change":"hi earth"}`);
    assertEquals(test.change, "hello world");
  },
});

test({
  name: "Preserves string type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      test!: string;
    }
    assertEquals(
      typeof new Test().fromJson(`{"test":"string"}`).test,
      "string"
    );
  },
});

test({
  name: "Preserves number type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      zero!: number;
      @SerializeProperty()
      one!: number;
    }
    const test = new Test().fromJson(`{"zero":0,"one":1}`);
    assertEquals(typeof test.zero, "number");
    assertEquals(typeof test.one, "number");
  },
});

test({
  name: "Preserves boolean type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      true!: boolean;
      @SerializeProperty()
      false!: boolean;
    }
    const test = new Test().fromJson(`{"true":true,"false":false}`);
    assertEquals(typeof test.true, "boolean");
    assertEquals(typeof test.false, "boolean");
  },
});

test({
  name: "Preserves null type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      null!: null;
    }
    const test = new Test().fromJson(`{"null":null}`);
    assertStrictEquals(test.null, null);
  },
});

test({
  name: "Preserves object type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      object!: Record<string | symbol, unknown>;
    }
    const test = new Test().fromJson(`{"object":{"test":"worked"}}`);
    assertEquals(test.object.test, "worked");
  },
});

test({
  name: "Preserves array type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      array!: unknown[];
    }
    const test = new Test().fromJson(
      `{"array":["worked",0,{"subObj":["cool"]}]}`
    );
    assert(Array.isArray(test.array));
    assertEquals(test.array.length, 3);
    assert(Array.isArray(test.array[2].subObj));
    assertEquals(typeof test.array[1], "number");
  },
});

test({
  name: "Revives an array of `type`",
  fn() {
    class OtherClass extends Serializable<OtherClass> {
      @SerializeProperty()
      id!: number;
    }
    class Test extends Serializable<Test> {
      @SerializeProperty({
        reviveStrategy: (v: OtherClass) => new OtherClass().fromJson(v),
      })
      array!: OtherClass[];
    }
    const test = new Test().fromJson(
      `{"array":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}]}`
    );
    assertEquals(test.array.length, 5);
    assert(test.array[0] instanceof OtherClass);
    assertEquals(test.array[4].id, 5);
  },
});

test({
  name: "Will not serialize properties that are not decorated",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty("serialize_me")
      serializeMe = "nice";
      dontSerializeMe = "great";
    }
    const test = new Test();
    assertEquals(test.serializeMe, "nice");
    assertEquals(test.dontSerializeMe, "great");
    assertEquals(test.toJson(), `{"serialize_me":"nice"}`);
  },
});

test({
  name: "Errors on duplicate map keys",
  fn() {
    try {
      class Test extends Serializable<Test> {
        @SerializeProperty("serialize_me")
        serializeMe = "nice";
        @SerializeProperty("serialize_me")
        serializeMeToo = "great";
      }
      fail("Allowed duplicate propertyName");
    } catch (e) {
      assertEquals(
        e.message,
        `${DUPLICATE_SERIALIZE_KEY_ERROR_MESSAGE}: serialize_me`
      );
    }
  },
});

test({
  name: "Inherited class key override serialize",
  fn() {
    class Test1 extends Serializable<Test1> {
      @SerializeProperty("serialize_me")
      serializeMe = "nice1";
    }
    class Test2 extends Test1 {
      @SerializeProperty("serialize_me")
      serializeMeInstead = "nice2";
    }
    const test = new Test2();
    assertEquals(test.serializeMe, "nice1");
    assertEquals(test.serializeMeInstead, "nice2");
    assertEquals(test.toJson(), `{"serialize_me":"nice2"}`);
  },
});

test({
  name: "Inherited class key override deserialize",
  fn() {
    class Test1 extends Serializable<Test1> {
      @SerializeProperty("serialize_me")
      serializeMe = "nice1";
    }
    class Test2 extends Test1 {
      @SerializeProperty("serialize_me")
      serializeMeInstead = "nice2";
    }
    const test = new Test2();
    test.fromJson(`{"serialize_me":"override"}`);

    assertEquals(test.serializeMe, "nice1");
    assertEquals(test.serializeMeInstead, "override");
  },
});

test({
  name: "Inherited serialize key override serialize",
  fn() {
    class Test1 extends Serializable<Test1> {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Test1 {
      @SerializeProperty("serialize_me_2")
      serializeMe = "nice2";
    }
    const test = new Test2();
    assertEquals(test.serializeMe, "nice2");
    assertEquals(test.toJson(), `{"serialize_me_2":"nice2"}`);
  },
});

test({
  name: "Inherited serialize key override deserialize",
  fn() {
    class Test1 extends Serializable<Test1> {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Test1 {
      @SerializeProperty("serialize_me_2")
      serializeMe = "nice2";
    }
    const test = new Test2();

    test.fromJson(
      `{"serialize_me_1":"ignore me", "serialize_me_2":"override"}`
    );
    assertEquals(test.serializeMe, "override");
  },
});

test({
  name: "deserialize nested",
  fn() {
    class Test1 extends Serializable<Test1> {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Serializable<Test2> {
      @SerializeProperty({
        serializedKey: "serialize_me_2",
        reviveStrategy: (json) => new Test1().fromJson(json),
      })
      nested!: Test1;
    }
    const test = new Test2();

    test.fromJson(`{"serialize_me_2": { "serialize_me_1":"ignore me"}}`);
    assertEquals(test.nested.serializeMe, "ignore me");
  },
});

test({
  name: "Serialize nested",
  fn() {
    class Test1 extends Serializable<Test1> {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Serializable<Test2> {
      @SerializeProperty({
        serializedKey: "serialize_me_2",
        reviveStrategy: (json) => new Test1().fromJson(json),
      })
      nested: Test1 = new Test1();
    }
    const test = new Test2();

    assertEquals(
      test.toJson(),
      `{"serialize_me_2":{"serialize_me_1":"nice1"}}`
    );
  },
});
