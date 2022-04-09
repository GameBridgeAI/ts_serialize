// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONObject, Serializable } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";
import {
  assert,
  assertEquals,
  assertNotEquals,
  fail,
  test,
} from "./test_deps.ts";
import {
  polymorphicClassFromJSON,
  PolymorphicResolver,
  PolymorphicSwitch,
} from "./polymorphic.ts";
import { ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS } from "./error_messages.ts";

test({
  name:
    "polymorphicClassFromJSON errors if target class has no polymorphic children",
  fn() {
    class Test extends Serializable {
    }

    try {
      polymorphicClassFromJSON(Test, {});

      fail("polymorphicClassFromJSON did not error with no context");
    } catch (e) {
      assertEquals(e.message, ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS);
    }
  },
});

test({
  name:
    "should be able to deserialize a polymorphic class using a polymorphic resolver",
  fn() {
    class ResolverHelperClass extends Serializable {
      @SerializeProperty()
      public _class?: string;
    }

    abstract class AbstractClass extends Serializable {
      // Property name can be whatever, even an inaccessible symbol
      @PolymorphicResolver
      public static [Symbol()](
        json: string | JSONObject,
      ): Serializable {
        const inputObject = new ResolverHelperClass().fromJSON(json);

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
    assertEquals(polyClass.someProperty, "new value");
  },
});

test({
  name: "polymorphic resolver should work for multiple classes",
  fn() {
    class ResolverHelperClass extends Serializable {
      @SerializeProperty()
      public _class?: string;
    }

    abstract class AbstractClass extends Serializable {
      // Property name can be whatever, even an inaccessible symbol
      @PolymorphicResolver
      public static [Symbol()](
        json: string | JSONObject,
      ): Serializable {
        const inputObject = new ResolverHelperClass().fromJSON(json);

        switch (inputObject._class) {
          case "TestClass1":
            return new TestClass1();
          case "TestClass2":
            return new TestClass2();
          default:
            throw new Error(
              `Unable to determine polymorphic class type ${inputObject._class}`,
            );
        }
      }
    }

    class TestClass1 extends AbstractClass {
      @SerializeProperty()
      public someProperty = "some default value";
    }
    class TestClass2 extends AbstractClass {
      @SerializeProperty()
      public someOtherProperty = "some default value";
    }

    const testData1 = { _class: "TestClass1", someProperty: "new value" };

    const polyClass1 = polymorphicClassFromJSON(AbstractClass, testData1);

    assert(polyClass1 instanceof TestClass1);
    assertEquals(polyClass1.someProperty, "new value");

    const testData2 = {
      _class: "TestClass2",
      someOtherProperty: "other new value",
    };

    const polyClass2 = polymorphicClassFromJSON(AbstractClass, testData2);

    assert(polyClass2 instanceof TestClass2);
    assertEquals(polyClass2.someOtherProperty, "other new value");
  },
});

test({
  name: "polymorphic switch",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public class = "TestClass";

      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { "class": "TestClass", "someProperty": "new value" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals((polyClass as TestClass).someProperty, "new value");
  },
});

test({
  name: "polymorphic switch should ignore classes that aren't serializable",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public class = "TestClass";

      public someProperty = "original value";
    }

    const testData = { "class": "TestClass", "someProperty": "new value" };
    try {
      polymorphicClassFromJSON(AbstractClass, testData);
      fail("Should not be able to resolve child of AbstractClass");
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.message, "Failed to resolve polymorphic class");
    }
  },
});

test({
  name:
    "polymorphic switch should not be able to serialize properties that aren't serializable",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public class = "TestClass";
      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { "class": "TestClass", "someProperty": "new value" };
    try {
      polymorphicClassFromJSON(AbstractClass, testData);
      fail("Should not be able to resolve child of AbstractClass");
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.message, "Failed to resolve polymorphic class");
    }
  },
});

test({
  name: "polymorphic switch symbol property name",
  fn() {
    abstract class AbstractClass extends Serializable {}

    const symbol = Symbol("some symbol name");
    class TestClass extends AbstractClass {
      @SerializeProperty("class")
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public [symbol]: string;

      @SerializeProperty()
      public someProperty?: string;
    }

    const testData = { "class": "TestClass", "someProperty": "new value" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals((polyClass as TestClass).someProperty, "new value");
    assertEquals((polyClass as TestClass)[symbol], "TestClass");
  },
});

test({
  name: "polymorphic switch resolver works across multiple properties",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public _class = "TestClass";
    }
    class TestClass2 extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass2(), "amazing")
      public aDifferentField = "Some non _class field";
    }

    const testData = { aDifferentField: "amazing" };

    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass2);
    assertEquals(polyClass.aDifferentField, "amazing");
  },
});

test({
  name: "polymorphic switch resolver works with multiple classes",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass1 extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass1(), "TestClass1")
      public _class = "TestClass1";

      @SerializeProperty()
      public someProperty = "original value";
    }

    class TestClass2 extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass2(), "TestClass2")
      public _class = "TestClass2";

      @SerializeProperty()
      public someProperty = "original value";
    }
    class TestClass3 extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass3(), "TestClass3")
      public _class = "TestClass3";

      @SerializeProperty()
      public someProperty = "original value";
    }
    class TestClass4 extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass4(), "TestClass4")
      public _class = "TestClass4";

      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData1 = { _class: "TestClass1", someProperty: "new value" };

    const polyClass1 = polymorphicClassFromJSON(AbstractClass, testData1);

    assert(polyClass1 instanceof TestClass1);
    assertEquals(polyClass1.someProperty, "new value");

    const testData2 = { _class: "TestClass2", someProperty: "new value" };

    const polyClass2 = polymorphicClassFromJSON(AbstractClass, testData2);

    assert(polyClass2 instanceof TestClass2);
    assertEquals(polyClass2.someProperty, "new value");
  },
});

test({
  name:
    "should throw an error if the polymorphic class trying to be resolved doesn't exist",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class _TestClass extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new _TestClass(), "TestClass")
      public class = "TestClass";

      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { class: "Unknown class", someProperty: "new value" };
    try {
      polymorphicClassFromJSON(AbstractClass, testData);
    } catch (e) {
      assert(!!e);
      return;
    }
    fail();
  },
});

test({
  name: "polymorphic switch supports custom tsTransformKeys",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public class = "TestClass";

      @SerializeProperty()
      public someProperty = "original value";

      public tsTransformKey(key: string): string {
        return "+" + key;
      }
    }

    const testData = { "+class": "TestClass", "+someProperty": "new value" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals((polyClass as TestClass).someProperty, "new value");
  },
});

test({
  name: "polymorphic switch supports inherited custom tsTransformKeys",
  fn() {
    abstract class AbstractClass extends Serializable {
      public tsTransformKey(key: string): string {
        return "!" + key;
      }
    }

    class TestClass extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public class = "TestClass";

      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { "!class": "TestClass", "!someProperty": "new value" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals((polyClass as TestClass).someProperty, "new value");
  },
});

test({
  name: "polymorphic switch supports custom property names",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @SerializeProperty("some_class")
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public class = "TestClass";

      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { "some_class": "TestClass", someProperty: "some value" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals((polyClass as TestClass).someProperty, "some value");
  },
});

test({
  name: "polymorphic switch custom fromJSONStrategy",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @SerializeProperty({ fromJSONStrategy: (value) => "+" + value })
      @PolymorphicSwitch(
        () => new TestClass(),
        // fromJSONStrategy prepends a + to whatever the input value
        "+TestClass",
      )
      public class?: string;
    }

    const testData = { class: "TestClass" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals((polyClass as TestClass).class, "+TestClass");
  },
});

test({
  name: "polymorphic switch custom test",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(
        () => new TestClass(),
        // Test if "class" is truthy
        (propertyValue: unknown) => !!propertyValue,
      )
      public class = "TestClass";
    }

    const testData = { "class": "Whatever" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals((polyClass as TestClass).class, "Whatever");
  },
});

test({
  name: "polymorphic switch complex custom test",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass2020 extends AbstractClass {
      @SerializeProperty({
        fromJSONStrategy: (value) => new Date(value as string),
      })
      // Only deserialize if this value matches the year 2020
      @PolymorphicSwitch(
        () => new TestClass2020(),
        (propertyValue) => (propertyValue as Date).getFullYear() === 2020,
      )
      public someDate?: Date;
    }

    class TestClassOtherYear extends AbstractClass {
      @SerializeProperty({
        fromJSONStrategy: (value) => new Date(value as string),
      })
      // Only deserialize if this value doesn't match the year 2020
      @PolymorphicSwitch(
        () => new TestClassOtherYear(),
        (propertyValue) => (propertyValue as Date).getFullYear() !== 2020,
      )
      public someDate?: Date;
    }

    const testData = { "someDate": "2020-06-01" };
    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass2020);
    assertEquals((polyClass as TestClass2020).someDate?.getFullYear(), 2020);

    const testData2 = `{ "someDate": "2010-06-01" }`;
    const polyClass2 = polymorphicClassFromJSON(AbstractClass, testData2);

    assert(polyClass2 instanceof TestClassOtherYear);
    assertNotEquals(
      (polyClass2 as TestClassOtherYear).someDate?.getFullYear(),
      2020,
    );
  },
});
