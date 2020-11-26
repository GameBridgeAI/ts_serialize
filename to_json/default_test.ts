// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../test_deps.ts";
import { defaultToJSON } from "./default.ts";

test({
  name: "defaultToJSON passes the value unmodified",
  fn() {
    assertEquals(defaultToJSON("Hello world"), "Hello world");
  },
});
