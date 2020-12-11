// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "./test_deps.ts";
import * as mod from "./mod.ts";

test({
  name: "Public API assertions",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.SerializeProperty, "function");
    assertEquals(typeof mod.Serializable, "function");
    assertEquals(typeof mod.composeStrategy, "function");
    assertEquals(typeof mod.createDateStrategy, "function");
    assertEquals(typeof mod.iso8601Date, "function");
    assertEquals(typeof mod.toSerializable, "function");
    assertEquals(typeof mod.toObjectContaining, "function");
    assertEquals(typeof mod.fromObjectContaining, "function");
    assertEquals(typeof mod.polymorphicClassFromJSON, "function");
    assertEquals(typeof mod.PolymorphicResolver, "function");
    assertEquals(typeof mod.PolymorphicSwitch, "function");

    assertEquals(Object.keys(mod).length, 11);
  },
});
