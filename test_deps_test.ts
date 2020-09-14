// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "./test_deps.ts";
import * as mod from "./test_deps.ts";

test({
  name: "Test the testers",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.test, "function");
    assertEquals(typeof mod.assert, "function");
    assertEquals(typeof mod.assertEquals, "function");
    assertEquals(typeof mod.assertStrictEquals, "function");
    assertEquals(typeof mod.fail, "function");
    assertEquals(Object.keys(mod).length, 5);
  },
});
