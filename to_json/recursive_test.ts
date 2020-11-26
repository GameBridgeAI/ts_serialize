// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../test_deps.ts";
import { recursiveToJSON } from "./recursive.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

test({
  name: "recursiveToJSON manages inheritance",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      id = 1;
    }

    const testObj = new Test();
    assertEquals(recursiveToJSON(testObj).id, 1);
  },
});
