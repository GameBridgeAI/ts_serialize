// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assertEquals } from "../test_deps.ts";
import { recursiveToJson } from "./recursive.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

test({
  name: "recursiveToJson manages inheritance",
  fn() {
    class Test extends Serializable {
      @SerializeProperty()
      id = 1;
    }

    const test = new Test();
    assertEquals(recursiveToJson(test).id, 1);
  },
});
