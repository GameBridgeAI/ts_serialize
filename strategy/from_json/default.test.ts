// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "../../deps_test.ts";
import { fromJSONDefault } from "./default.ts";

Deno.test({
  name: "fromJSONDefault passes the value unmodified",
  fn() {
    assertEquals(fromJSONDefault("Hello world"), "Hello world");
  },
});
