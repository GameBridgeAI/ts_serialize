// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "./test_deps.ts";
import * as mod from "./mod.ts";

test({
  name: "Public API assertions",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.SerializeProperty, "function");
    assertEquals(typeof mod.Serializable, "function");
    assertEquals(typeof mod.composeStrategy, "function");
    assertEquals(typeof mod.createDateStrategy, "function");
    assertEquals(typeof mod.ISODateFromJson, "function");
    assertEquals(typeof mod.fromJsonAs, "function");

    assertEquals(Object.keys(mod).length, 6);
  },
});
