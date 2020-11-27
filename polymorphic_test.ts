// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue, Serializable } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";
import { assert, assertEquals, fail, test } from "./test_deps.ts";
import {
  polymorphicClassFromJSON,
  PolymorphicResolver,
  PolymorphicSwitch,
} from "./polymorphic.ts";

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
        input: string | JSONValue | Object,
      ): Serializable {
        const inputObject = new ResolverHelperClass().fromJSON(input);

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
  name:
    "should be able to deserialize a polymorphic class using a polymorphic switch resolver",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass())
      public static _class = "TestClass";
      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { _class: "TestClass", someProperty: "new value" };

    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals(polyClass.someProperty, "new value");
  },
});

test({
  name:
    "should be able to deserialize a polymorphic class using a polymorphic switch resolver across multiple properties",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass())
      public static _class = "TestClass";
    }
    class TestClass2 extends AbstractClass {
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
  name:
    "should be able to deserialize a polymorphic class using a polymorphic switch resolver using an instance property",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass extends AbstractClass {
      @SerializeProperty()
      @PolymorphicSwitch(() => new TestClass(), "TestClass")
      public _class = "TestClass";
      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { _class: "TestClass", someProperty: "new value" };

    const polyClass = polymorphicClassFromJSON(AbstractClass, testData);

    assert(polyClass instanceof TestClass);
    assertEquals(polyClass.someProperty, "new value");
  },
});

test({
  name: "polymorphic switch resolver should work with multiple classes",
  fn() {
    abstract class AbstractClass extends Serializable {}

    class TestClass1 extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass1())
      public static _class = "TestClass1";
      @SerializeProperty()
      public someProperty = "original value";
    }

    class TestClass2 extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass2())
      public static _class = "TestClass2";
      @SerializeProperty()
      public someProperty = "original value";
    }
    class TestClass3 extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass3())
      public static _class = "TestClass3";
      @SerializeProperty()
      public someProperty = "original value";
    }
    class TestClass4 extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass4())
      public static _class = "TestClass4";
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

    class TestClass extends AbstractClass {
      @PolymorphicSwitch(() => new TestClass())
      public static _class = "TestClass";
      @SerializeProperty()
      public someProperty = "original value";
    }

    const testData = { _class: "Unknown class", someProperty: "new value" };
    try {
      polymorphicClassFromJSON(AbstractClass, testData);
    } catch (e) {
      assert(!!e);
      return;
    }
    fail();
  },
});
