// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals, fail } from "../test_deps.ts";
import {
  reviveFromJsonAs,
  ERROR_MESSAGE_TYPEOF_FROM_JSON,
} from "./revive_from_json.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

test({
  name: "reviveFromJson revives using `fromJson` as type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      test = true;
    }
    const test = new Test();
    assertEquals(reviveFromJsonAs(Test)(test).test, test.test);
    assert(reviveFromJsonAs(Test)(test) instanceof Test);
  },
});

test({
  name: "reviveFromJson errors if `fromJson` is not a function",
  fn() {
    class Test {
      @SerializeProperty()
      test = true;
    }
    const test = new Test();
    try {
      assert(reviveFromJsonAs(Test)(test) instanceof Test);
      fail("fromJson called with it is not a function");
    } catch (error) {
      assertEquals(error.message, ERROR_MESSAGE_TYPEOF_FROM_JSON);
    }
  },
});
