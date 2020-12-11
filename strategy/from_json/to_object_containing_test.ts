// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "../../test_deps.ts";
import { toObjectContaining } from "./to_object_containing.ts";
import { Serializable } from "../../serializable.ts";
import { SerializeProperty } from "../../serialize_property.ts";
import { fail } from "https://deno.land/std@0.79.0/testing/asserts.ts";
import {
  ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE,
  ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE,
} from "../../error_messages.ts";

test({
  name: "toObjectContaining revives using `fromJSON` as type",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
      test!: { [k: string]: SomeClass };
    }

    const testObj = new Test().fromJSON(
      { test: { testing: { someClassProp: "changed" } } },
    );
    assert(testObj.test.testing instanceof Serializable);
    assertEquals(testObj.test.testing.someClassProp, "changed");
  },
});

test({
  name: "toObjectContaining revives using `fromJSON` as type[]",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
      test!: { [k: string]: SomeClass[] };
    }

    const testObj = new Test().fromJSON(
      {
        test: {
          testing: [{ someClassProp: "changed" }, { someClassProp: "changed" }],
        },
      },
    );
    assert(Array.isArray(testObj.test.testing));
    assert(testObj.test.testing[0] instanceof Serializable);
    assertEquals(testObj.test.testing[0].someClassProp, "changed");
  },
});

test({
  name:
    "toObjectContaining revives subclass as null with null as a subclass value",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
      test!: { [k: string]: SomeClass[] };
    }

    const testObj = new Test().fromJSON({ test: { testing: null } });
    assertEquals(testObj.test.testing, null);
  },
});

test({
  name: "toObjectContaining revives as null with null as a value",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
      test!: { [k: string]: SomeClass[] };
    }

    const testObj = new Test().fromJSON({ test: null });
    assertEquals(testObj.test, null);
  },
});

test({
  name: "toObjectContaining sub-value must be an [object Object]",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
      test!: { [k: string]: SomeClass };
    }
    try {
      const testObj = new Test().fromJSON(
        { test: { testing: "changed" } },
      );
      fail(`testObj ${testObj} did not fail`);
    } catch (error) {
      assertEquals(error.message, ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
    }
  },
});

test({
  name: "toObjectContaining value must be an [object Object]",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
      test!: { [k: string]: SomeClass };
    }
    try {
      const testObj = new Test().fromJSON(
        { test: "changed" },
      );
      fail(`testObj ${testObj} did not fail`);
    } catch (error) {
      assertEquals(error.message, ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE);
    }
  },
});

test({
  name:
    "toObjectContaining throws is array sub-value values are not [object Object]",
  fn() {
    class SomeClass extends Serializable {
      @SerializeProperty()
      someClassProp = "test";
    }

    class Test extends Serializable {
      @SerializeProperty({ fromJSONStrategy: toObjectContaining(SomeClass) })
      test!: { [k: string]: SomeClass[] };
    }

    try {
      const testObj = new Test().fromJSON(
        {
          test: {
            testing: [88],
          },
        },
      );
      fail(`testObj ${testObj} did not fail`);
    } catch (error) {
      assertEquals(error.message, ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
    }
  },
});

test({
  name: "toObjectContaining works with constructor arguments",
  fn() {
    class SomeClass extends Serializable {
      constructor(someClassProp: string) {
        super();
        this.someClassProp = someClassProp;
      }
      @SerializeProperty()
      someClassProp: string;
    }

    class Test extends Serializable {
      @SerializeProperty(
        {
          fromJSONStrategy: toObjectContaining(() =>
            new SomeClass("from_constructor")
          ),
        },
      )
      test!: { [k: string]: SomeClass };
    }

    const testObj = new Test().fromJSON(
      { test: { testing: {} } },
    );
    assert(testObj.test.testing instanceof Serializable);
    assertEquals(testObj.test.testing.someClassProp, "from_constructor");
  },
});
