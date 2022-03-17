// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../../test_deps.ts";
import { fromJSONDefault } from "./default.ts";

test({
  name: "fromJSONDefault passes the value unmodified",
  fn() {
    assertEquals(fromJSONDefault("Hello world"), "Hello world");
  },
});
