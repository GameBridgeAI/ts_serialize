// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../test_deps.ts";
import { defaultFromJSON } from "./default.ts";

test({
  name: "defaultFromJSON passes the value unmodified",
  fn() {
    assertEquals(defaultFromJSON("Hello world"), "Hello world");
  },
});
