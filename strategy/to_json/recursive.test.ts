// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "@std/assert/equals";

import { toJSONRecursive } from "./recursive.ts";
import { Serializable } from "../../serializable.ts";
import { SerializeProperty } from "../../serialize_property.ts";

Deno.test({
  name: "toJSONRecursive manages inheritance",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      public id = 1;
    }

    const testObj = new Test();
    assertEquals(toJSONRecursive(testObj).id, 1);
  },
});
