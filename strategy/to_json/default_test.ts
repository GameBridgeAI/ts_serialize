// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../../test_deps.ts";
import { toJSONDefault } from "./default.ts";

test({
  name: "toJSONDefault passes the value unmodified",
  fn() {
    assertEquals(toJSONDefault("Hello world"), "Hello world");
  },
});
