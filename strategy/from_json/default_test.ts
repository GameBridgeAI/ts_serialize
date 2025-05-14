// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "@std/assert";
import { test } from "@std/testing/bdd";
import { fromJSONDefault } from "./default.ts";

test({
  name: "fromJSONDefault passes the value unmodified",
  fn() {
    assertEquals(fromJSONDefault("Hello world"), "Hello world");
  },
});
