// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "@std/assert";
import { toJSONDefault } from "./default.ts";

Deno.test({
  name: "toJSONDefault passes the value unmodified",
  fn() {
    assertEquals(toJSONDefault("Hello world"), "Hello world");
  },
});
