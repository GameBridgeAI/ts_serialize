// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "@std/assert";
import { test } from "@std/testing/bdd";
import { toJSONDefault } from "./default.ts";

test({
  name: "toJSONDefault passes the value unmodified",
  fn() {
    assertEquals(toJSONDefault("Hello world"), "Hello world");
  },
});
