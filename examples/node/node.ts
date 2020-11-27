// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  composeStrategy,
  createDateStrategy,
  FromJSONStrategy,
  iso8601Date,
  JSONValue,
  polymorphicClassFromJSON,
  PolymorphicResolver,
  PolymorphicSwitch,
  Serializable,
  SerializeProperty,
  ToJSONStrategy,
  toSerializable,
  TransformKey,
} from "@gamebridgeai/ts_serialize";
import toJSONFixture from "../fixtures/to.json";
import fromJSONFixture from "../fixtures/from.json";

function assert(boolean: boolean, msg?: string): void {
  if (!boolean) {
    console.error(msg || "Assertion failed");
    process.exit(1);
  }
}

const customStrategy = (v: string) => `${v} strategy changed`;
const fromJSONStrategy: FromJSONStrategy = (v: string) => `${v} strategy`;
const toJSONStrategy: ToJSONStrategy = (v: string) => `${v} changed`;
const customDateStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);

class Nested extends Serializable {
  @SerializeProperty("sub_property")
  subProperty = "toJSON";
}

class Test extends Serializable {
  notSerialized = "not serialized";

  @SerializeProperty()
  serializedPropertyNoArg = "toJSON";

  @SerializeProperty("rename_test")
  renameTest = "toJSON";

  @SerializeProperty({ serializedKey: "rename_test_by_property" })
  renameTestByProperty = "toJSON";

  @SerializeProperty({ fromJSONStrategy: customStrategy })
  fromJSONStrategyTest = "toJSON";

  @SerializeProperty({ toJSONStrategy: customStrategy })
  toJSONStrategyTest = "toJSON";

  @SerializeProperty(
    {
      toJSONStrategy: composeStrategy(
        fromJSONStrategy,
        (v: string) => `${v} changed`,
      ),
      fromJSONStrategy: composeStrategy(
        (v: string) => `${v} strategy`,
        toJSONStrategy,
      ),
    },
  )
  composeStrategyTest = "toJSON";

  @SerializeProperty({ fromJSONStrategy: toSerializable(Nested) })
  asTest = new Nested();

  @SerializeProperty({ fromJSONStrategy: iso8601Date })
  isoDate = new Date("2020-06-04T19:01:47.831Z");

  @SerializeProperty({ fromJSONStrategy: customDateStrategy })
  createDate = new Date("2099-11-25");
}
assert(new Test().toJSON() === JSON.stringify(toJSONFixture), "toJSON()");
const test = new Test().fromJSON(fromJSONFixture);
assert(test.notSerialized === "not serialized", "notSerialized");
assert(test.serializedPropertyNoArg === "fromJSON", "serializedPropertyNoArg");
assert(test.renameTest === "fromJSON", "renameTest");
assert(test.renameTestByProperty === "fromJSON", "renameTestByProperty");
assert(
  test.fromJSONStrategyTest === "fromJSON strategy changed",
  "fromJSONStrategyTest",
);
assert(test.toJSONStrategyTest === "fromJSON", "toJSONStrategyTest");
assert(
  test.composeStrategyTest === "fromJSON strategy changed",
  "composeStrategyTest",
);
assert(test.asTest instanceof Nested, "asTest instanceof");
assert(
  test.asTest.subProperty === "fromJSON",
  "asTest.subProperty",
);
assert(test.isoDate instanceof Date, "isoDate instanceof");
assert(test.isoDate.getFullYear() === 2020, "isoDate.getFullYear()");
assert(test.createDate instanceof Date, "createDate instanceof");
assert(test.createDate.getFullYear() === 2099, "createDate.getFullYear()");

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

assert(new TestTransformKey2().toJSON() === `{"__test2__":"test2"}`);
assert(
  new TestTransformKey2().fromJSON({ __test2__: "changed" }).test2 ===
    `changed`,
);

assert(
  new TestTransformKey3().toJSON() ===
    `{"__test2__":"test2","--test3--":"test3"}`,
);
assert(
  new TestTransformKey3().fromJSON({ "--test3--": "changed" }).test3 ===
    `changed`,
);

assert(
  new TestTransformKey4().toJSON() ===
    `{"__test2__":"test2","--test3--":"test3","--test4--":"test4"}`,
);
assert(
  new TestTransformKey4().fromJSON({ "--test4--": "changed" }).test4 ===
    `changed`,
);

class ResolverHelperClass extends Serializable {
  @SerializeProperty()
  public _class?: string;
}

abstract class AbstractClass extends Serializable {
  // Property name can be whatever, even an inaccessible symbol
  @PolymorphicResolver
  public static [Symbol()](
    input: string | JSONValue | Object,
  ): Serializable {
    const inputObject = new ResolverHelperClass().fromJSON(input);

    switch (inputObject._class) {
      case "TestClass":
        return new TestClass();
      default:
        throw new Error(
          `Unable to determine polymorphic class type ${inputObject._class}`,
        );
    }
  }
}

class TestClass extends AbstractClass {
  @SerializeProperty()
  public someProperty = "some default value";
}

const testData = { _class: "TestClass", someProperty: "new value" };

const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

assert(polyClass instanceof TestClass);
assert(polyClass.someProperty === "new value");

abstract class AbstractClass2 extends Serializable {}

class TestClass1 extends AbstractClass2 {
  @PolymorphicSwitch(() => new TestClass1())
  public static _class = "TestClass1";
  @SerializeProperty()
  public someProperty = "original value";
}

class TestClass2 extends AbstractClass2 {
  @PolymorphicSwitch(() => new TestClass2())
  public static _class = "TestClass2";
  @SerializeProperty()
  public someProperty = "original value";
}

const testData1 = { _class: "TestClass1", someProperty: "new value" };

const polyClass1 = polymorphicClassFromJSON(AbstractClass2, testData1);

assert(polyClass1 instanceof TestClass1);
assert(polyClass1.someProperty === "new value");

const testData2 = { _class: "TestClass2", someProperty: "new value" };

const polyClass2 = polymorphicClassFromJSON(AbstractClass2, testData2);

assert(polyClass2 instanceof TestClass2);
assert(polyClass2.someProperty === "new value");
