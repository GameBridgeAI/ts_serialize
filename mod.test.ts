// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals } from "./deps_test.ts";
import * as mod from "./mod.ts";

Deno.test({
  name: "Public API assertions",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.SerializeProperty, "function");
    assertEquals(typeof mod.Serializable, "function");
    assertEquals(typeof mod.composeStrategy, "function");
    assertEquals(typeof mod.createDateStrategy, "function");
    assertEquals(typeof mod.iso8601Date, "function");
    assertEquals(typeof mod.toSerializable, "function");
    assertEquals(typeof mod.fromSerializable, "function");
    assertEquals(typeof mod.toObjectContaining, "function");
    assertEquals(typeof mod.fromObjectContaining, "function");
    assertEquals(typeof mod.polymorphicClassFromJSON, "function");
    assertEquals(typeof mod.PolymorphicResolver, "function");
    assertEquals(typeof mod.PolymorphicSwitch, "function");
    assertEquals(typeof mod.getNewSerializable, "function");

    assertEquals(Object.keys(mod).length, 13);
  },
});
