// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "./test_deps.ts";
import { composeStrategy, Serializable, TransformKey } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";

test({
  name: "adds methods to extended classes",
  fn() {
    class TestClass extends Serializable {}
    const testObj = new TestClass();
    assert(testObj instanceof Serializable);
    assertEquals(typeof testObj.toJson, "function");
    assertEquals(typeof testObj.fromJson, "function");
  },
});

test({
  name: "composeStrategy composes a List of functions",
  fn() {
    const addLetter = (letter: string) => (v: string) => `${v}${letter}`;
    const shout = (v: string) => `${v}!!!`;
    const strategy = composeStrategy(
      addLetter(" "),
      addLetter("W"),
      addLetter("o"),
      addLetter("r"),
      addLetter("l"),
      addLetter("d"),
      shout,
    );
    assertEquals(strategy("Hello"), "Hello World!!!");
  },
});

test({
  name: "does not run TransformKey if not implemented",
  fn() {
    class TestTransformKey extends Serializable {
      @SerializeProperty()
      public test = "test";
    }

    assertEquals(new TestTransformKey().toJson(), `{"test":"test"}`);
    assertEquals(
      new TestTransformKey().fromJson({ test: "changed" }).test,
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

    assertEquals(new TestTransformKey().toJson(), `{"__test__":"test"}`);
    assertEquals(
      new TestTransformKey().fromJson({ __test__: "changed" }).test,
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

    assertEquals(new TestTransformKey2().toJson(), `{"__test2__":"test2"}`);
    assertEquals(
      new TestTransformKey2().fromJson({ __test2__: "changed" }).test2,
      `changed`,
    );

    assertEquals(
      new TestTransformKey3().toJson(),
      `{"__test2__":"test2","__test3__":"test3"}`,
    );
    assertEquals(
      new TestTransformKey3().fromJson({ __test3__: "changed" }).test3,
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

    assertEquals(new TestTransformKey2().toJson(), `{"__test2__":"test2"}`);
    assertEquals(
      new TestTransformKey2().fromJson({ __test2__: "changed" }).test2,
      `changed`,
    );

    assertEquals(
      new TestTransformKey3().toJson(),
      `{"__test2__":"test2","--test3--":"test3"}`,
    );
    assertEquals(
      new TestTransformKey3().fromJson({ "--test3--": "changed" }).test3,
      `changed`,
    );

    assertEquals(
      new TestTransformKey4().toJson(),
      `{"__test2__":"test2","--test3--":"test3","--test4--":"test4"}`,
    );
    assertEquals(
      new TestTransformKey4().fromJson({ "--test4--": "changed" }).test4,
      `changed`,
    );
  },
});
