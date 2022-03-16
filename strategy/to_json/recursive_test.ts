// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../../test_deps.ts";
import { toJSONRecursive } from "./recursive.ts";
import { Serializable } from "../../serializable.ts";
import { SerializeProperty } from "../../serialize_property.ts";

test({
  name: "toJSONRecursive manages inheritance",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      id = 1;
    }

    const testObj = new Test();
    assertEquals(toJSONRecursive(testObj).id, 1);
  },
});
