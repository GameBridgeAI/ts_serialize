// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "./test_deps.ts";
import { Serializable, TransformKey } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";
import { toSerializable } from "./strategy/from_json/to_serializable.ts";

test({
  name: "adds methods to extended classes",
  fn() {
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
  },
});

test({
  name: "does not run TransformKey if not implemented",
  fn() {
    class TestTransformKey extends Serializable {
      @SerializeProperty()
      public test = "test";
    }

    assertEquals(new TestTransformKey().toJSON(), `{"test":"test"}`);
    assertEquals(
      new TestTransformKey().fromJSON({ test: "changed" }).test,
      `changed`,
    );
  },
});

test({
  name: "runs TransformKey without implementation declaration",
  fn() {
    class TestTransformKey extends Serializable {
      public tsTransformKey(key: string): string {
        return `__${key}__`;
      }

      @SerializeProperty()
      public test = "test";
    }

    assertEquals(new TestTransformKey().toJSON(), `{"__test__":"test"}`);
    assertEquals(
      new TestTransformKey().fromJSON({ __test__: "changed" }).test,
      `changed`,
    );
  },
});

test({
  name: "implements TransformKey to children",
  fn() {
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

    assertEquals(new TestTransformKey2().toJSON(), `{"__test2__":"test2"}`);
    assertEquals(
      new TestTransformKey2().fromJSON({ __test2__: "changed" }).test2,
      `changed`,
    );

    assertEquals(
      new TestTransformKey3().toJSON(),
      `{"__test2__":"test2","__test3__":"test3"}`,
    );
    assertEquals(
      new TestTransformKey3().fromJSON({ __test3__: "changed" }).test3,
      `changed`,
    );
  },
});

test({
  name: "implements TransformKey to children and children can change",
  fn() {
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

    assertEquals(new TestTransformKey2().toJSON(), `{"__test2__":"test2"}`);
    assertEquals(
      new TestTransformKey2().fromJSON({ __test2__: "changed" }).test2,
      `changed`,
    );

    assertEquals(
      new TestTransformKey3().toJSON(),
      `{"__test2__":"test2","--test3--":"test3"}`,
    );
    assertEquals(
      new TestTransformKey3().fromJSON({ "--test3--": "changed" }).test3,
      `changed`,
    );

    assertEquals(
      new TestTransformKey4().toJSON(),
      `{"__test2__":"test2","--test3--":"test3","--test4--":"test4"}`,
    );
    assertEquals(
      new TestTransformKey4().fromJSON({ "--test4--": "changed" }).test4,
      `changed`,
    );
  },
});

test({
  name: "implements TransformKey but respects override as string",
  fn() {
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
    }

    assertEquals(
      new TestTransformKey2().toJSON(),
      `{"__test2__":"test2","changed":"change me"}`,
    );
    assertEquals(
      new TestTransformKey2().fromJSON({ changed: "changed" }).changeMe,
      `changed`,
    );
  },
});

test({
  name: "implements TransformKey but respects override as property",
  fn() {
    class TestTransformKey extends Serializable implements TransformKey {
      public tsTransformKey(key: string): string {
        return `__${key}__`;
      }
    }

    class TestTransformKey2 extends TestTransformKey {
      @SerializeProperty()
      public test2 = "test2";

      @SerializeProperty({ serializedKey: "changed" })
      public changeMe = "change me";
    }

    assertEquals(
      new TestTransformKey2().toJSON(),
      `{"__test2__":"test2","changed":"change me"}`,
    );
    assertEquals(
      new TestTransformKey2().fromJSON({ changed: "changed" }).changeMe,
      `changed`,
    );
  },
});

test({
  // only: true,
  name:
    "Nested fields shouldn't overwrite containing class fields of the same name",
  fn() {
    class Embedded extends Serializable {
      @SerializeProperty()
      public field1?: string;
    }

    class Root extends Serializable {
      @SerializeProperty()
      field1?: string;
      @SerializeProperty({ fromJSONStrategy: toSerializable(Embedded) })
      public embedded?: Embedded[];
    }

    const input = {
      field1: "field_value_in_outer_class",
      embedded: [
        { field1: "field_value_in_inner_class" },
      ],
    };

    const root = new Root().fromJSON(input);
    assertEquals(root.field1, "field_value_in_outer_class");
  },
});

test({
  // only: true,
  name: "deserialize recursive nested with same field",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty()
      test_field = "Test1_test_field";
    }
    class Test2 extends Serializable {
      @SerializeProperty()
      test_field = "Test2_test_field";
      @SerializeProperty({
        fromJSONStrategy: (json) => new Test1().fromJSON(json),
      })
      nested!: Test1;
    }
    class Test3 extends Serializable {
      @SerializeProperty()
      test_field = "Test3_test_field";
      @SerializeProperty({
        fromJSONStrategy: (json) => new Test2().fromJSON(json),
      })
      nested!: Test2;
    }
    const testObj = new Test3();
    testObj.fromJSON(
      {
        "test_field": "3",
        "nested": {
          "test_field": "2",
          "nested": { "test_field": "1" },
        },
      },
    );
    assertEquals(testObj.test_field, "3");
    assertEquals(testObj.nested.test_field, "2");
    assertEquals(testObj.nested.nested.test_field, "1");
  },
});
