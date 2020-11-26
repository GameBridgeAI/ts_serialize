// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "../test_deps.ts";
import { as } from "./as.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

test({
  name: "as revives using `fromJSON` as type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      test = true;
    }
    const testObj = new Test();
    assertEquals(as(Test)({ test: true }).test, testObj.test);
    assert(as(Test)({ test: true }) instanceof Test);
  },
});

test({
  name: "as works in nested properties",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("test_one")
      test1 = true;
    }

    class Test2 extends Serializable {
      @SerializeProperty(
        { serializedKey: "test_two", fromJSONStrategy: as(Test1) },
      )
      test2 = new Test1();
    }

    class Test3 extends Test2 {
      @SerializeProperty("test_three")
      test3 = false;
    }

    const testObj = new Test3().fromJSON(
      `{"test_three":true,"test_two":{"test_one":false}}`,
    );

    assertEquals(testObj.test3, true);
    assert(testObj.test2 instanceof Test1);
    assertEquals(testObj.test2.test1, false);
  },
});

test({
  name: "as works with arrays of objects",
  fn() {
    class Test extends Serializable {
      @SerializeProperty("a_property")
      test = true;
    }
    const array: Test[] = as(Test)(
      [{ a_property: "v1" }, { a_property: "v2" }],
    );
    assertEquals(array.length, 2);
    assert(array[0] instanceof Test);
    assertEquals(array[0].test, "v1");
  },
});
