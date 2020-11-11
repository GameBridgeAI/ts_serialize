// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../test_deps.ts";
import { defaultFromJson } from "./default.ts";

test({
  name: "defaultFromJson passes the value unmodified",
  fn() {
    assertEquals(defaultFromJson("Hello world"), "Hello world");
  },
});
