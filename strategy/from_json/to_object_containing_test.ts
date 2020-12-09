// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "../../test_deps.ts";
import { toObjectContaining } from "./to_object_containing.ts";
import { Serializable } from "../../serializable.ts";
import { SerializeProperty } from "../../serialize_property.ts";

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
