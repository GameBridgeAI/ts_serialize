// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assertEquals } from "../test_deps.ts";
import { defaultToJson } from "./default_to_json.ts";

test({
  name: "defaultToJson passes the value unmodified",
  fn() {
    assertEquals(defaultToJson("Hello world"), "Hello world");
  },
});
