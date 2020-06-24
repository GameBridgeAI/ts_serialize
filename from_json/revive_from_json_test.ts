// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals, fail } from "../test_deps.ts";
import {
  fromJsonAs,
  ERROR_MESSAGE_TYPEOF_FROM_JSON,
} from "./revive_from_json.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

test({
  name: "fromJsonAs revives using `fromJson` as type",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty()
      test = true;
    }
    const test = new Test();
    assertEquals(fromJsonAs(Test)(test).test, test.test);
    assert(fromJsonAs(Test)(test) instanceof Test);
  },
});

test({
  name: "fromJsonAs errors if `fromJson` is not a function",
  fn() {
    class Test {
      @SerializeProperty()
      test = true;
    }
    const test = new Test();
    try {
      assert(fromJsonAs(Test)(test) instanceof Test);
      fail("fromJson called when it is not a function");
    } catch (error) {
      assertEquals(error.message, ERROR_MESSAGE_TYPEOF_FROM_JSON);
    }
  },
});
