// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "./test_deps.ts";
import * as mod from "./mod.ts";

test({
  name: "public API assertions",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.SerializeProperty, "function");
    assertEquals(typeof mod.Serializable, "function");
    assertEquals(typeof mod.composeReviveStrategy, "function");
    assertEquals(typeof mod.composeReplacerStrategy, "function");

    assertEquals(typeof mod.createDateReviver, "function");
    assertEquals(typeof mod.ISODateReviver, "function");

    assertEquals(typeof mod.defaultReplacer, "function");
    assertEquals(typeof mod.recursiveReplacer, "function");

    assertEquals(Object.keys(mod).length, 8);
  },
});
