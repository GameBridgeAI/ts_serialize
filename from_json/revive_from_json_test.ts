// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals, fail } from "../test_deps.ts";
import { fromJsonAs } from "./revive_from_json.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

test({
  name: "fromJsonAs revives using `fromJson` as type",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      test = true;
    }
    const test = new Test();
    assertEquals(fromJsonAs(Test)(test).test, test.test);
    assert(fromJsonAs(Test)(test) instanceof Test);
  },
});

test({
  name: "fromJsonAs works in nested properties",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("test_one")
      test1 = true;
    }

    class Test2 extends Serializable {
      @SerializeProperty(
        { serializedKey: "test_two", fromJsonStrategy: fromJsonAs(Test1) },
      )
      test2 = new Test1();
    }
    class Test3 extends Test2 {
      @SerializeProperty("test_three")
      test3 = false;
    }
    const test = new Test3().fromJson(
      `{"test_three":true,"test_two":{"test_one":false}}`,
    );
    assertEquals(test.test2.test1, false);
  },
});

test({
  name: "fromJsonAs works in nested properties",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("test_one")
      test1 = true;
    }

    class Test2 extends Serializable {
      @SerializeProperty(
        { serializedKey: "test_two", fromJsonStrategy: fromJsonAs(Test1) },
      )
      test2 = new Test1();
    }
    class Test3 extends Test2 {
      @SerializeProperty("test_three")
      test3 = false;
    }
    const test = new Test3().fromJson(
      `{"test_three":true,"test_two":{"test_one":false}}`,
    );
    assertEquals(test.test3, true);
    assert(test.test2 instanceof Test1);
    assertEquals(test.test2.test1, false);
  },
});
