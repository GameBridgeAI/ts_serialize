// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "./test_deps.ts";
import { Serializable, TransformKey } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";

test({
  name: "adds methods to extended classes",
  fn() {
    class TestClass extends Serializable {
      @SerializeProperty()
      public test: number = 99;
    }
    const testObj = new TestClass();
    assert(testObj instanceof Serializable);
    assertEquals(typeof testObj.toJSON, "function");
    assertEquals(typeof testObj.fromJSON, "function");
    assertEquals(typeof testObj.tsSerialize, "function");
    assertEquals(testObj.toJSON(), `{"test":99}`);
    assertEquals(new TestClass().fromJSON({ test: 88 }).test, 88);
    assertEquals(testObj.tsSerialize(), { test: 99 });
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
