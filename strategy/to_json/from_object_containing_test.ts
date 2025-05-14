// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "@std/assert";
import { fromObjectContaining } from "./from_object_containing.ts";
import { Serializable } from "../../serializable.ts";
import { SerializeProperty } from "../../serialize_property.ts";
import { toSerializable } from "../from_json/to_serializable.ts";

Deno.test({
  name: "fromObjectContaining builds from Serializable",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      public someClassProp = "test";
    }
    class Test extends Serializable {
      @SerializeProperty({ toJSONStrategy: fromObjectContaining() })
      public test: { [k: string]: SomeClass } = { testing: new SomeClass() };
    }

    assertEquals(
      new Test().toJSON(),
      `{"test":{"testing":{"someClassProp":"test"}}}`,
    );
  },
});

Deno.test({
  name: "fromObjectContaining uses right keys",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty("some_class_prop")
      public someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ toJSONStrategy: fromObjectContaining() })
      public test: { [_: string]: SomeClass } = { testing: new SomeClass() };
    }

    assertEquals(
      new Test().toJSON(),
      `{"test":{"testing":{"some_class_prop":"test"}}}`,
    );
  },
});

Deno.test({
  name: "fromObjectContaining works with array sub-values",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      public someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ toJSONStrategy: fromObjectContaining() })
      public test: { [k: string]: SomeClass[] } = {
        testing: [new SomeClass(), new SomeClass(), new SomeClass()],
      };
    }

    assertEquals(
      new Test().toJSON(),
      `{"test":{"testing":[{"someClassProp":"test"},{"someClassProp":"test"},{"someClassProp":"test"}]}}`,
    );
  },
});

Deno.test({
  name: "fromObjectContaining works with nested strategies",
  fn() {
    class TheClass extends Serializable {
      @SerializeProperty("the_class_prop")
      public theClassProp = "test";
    }
    class SomeClass extends Serializable {
      @SerializeProperty()
      public someClassProp = "test";

      @SerializeProperty({ fromJSONStrategy: toSerializable(TheClass) })
      public someOtherClassProp = new TheClass();
    }

    class Test extends Serializable {
      @SerializeProperty({ toJSONStrategy: fromObjectContaining() })
      public test: { [k: string]: SomeClass[] } = {
        testing: [new SomeClass(), new SomeClass(), new SomeClass()],
      };
    }
    assertEquals(
      new Test().toJSON(),
      `{"test":{"testing":[{"someClassProp":"test","someOtherClassProp":{"the_class_prop":"test"}},{"someClassProp":"test","someOtherClassProp":{"the_class_prop":"test"}},{"someClassProp":"test","someOtherClassProp":{"the_class_prop":"test"}}]}}`,
    );
  },
});
