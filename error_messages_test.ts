// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "./test_deps.ts";
import * as mod from "./error_messages.ts";

test({
  name: "Error messages assertions",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY, "string");
    assertEquals(typeof mod.ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY, "string");
    assertEquals(typeof mod.ERROR_MESSAGE_MISSING_PROPERTIES_MAP, "string");
    assertEquals(typeof mod.ERROR_MESSAGE_SYMBOL_PROPERTY_NAME, "string");

    assertEquals(Object.keys(mod).length, 4);
  },
});
