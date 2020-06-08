// Copyright 2018-2020 ts_serialize authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "./test_deps.ts";
import * as mod from "./mod.ts";

test({
  name: "public API assertions",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.SerializeProperty, "function");
    assertEquals(typeof mod.Serializable, "function");
    assertEquals(typeof mod.createDateReviver, "function");
    assertEquals(typeof mod.ISODateReviver, "function");
    assertEquals(typeof mod.composeReviveStrategy, "function");
    assertEquals(Object.keys(mod).length, 5);
  },
});
