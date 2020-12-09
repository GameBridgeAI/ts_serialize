// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "./test_deps.ts";
import * as mod from "./error_messages.ts";

test({
  name: "Error messages assertions",
  fn() {
    assert(mod != null);
    assertEquals(typeof mod.ERROR_DUPLICATE_PROPERTY_KEY, "string");
    assertEquals(typeof mod.ERROR_DUPLICATE_SERIALIZE_KEY, "string");
    assertEquals(typeof mod.ERROR_MISSING_PROPERTIES_MAP, "string");
    assertEquals(typeof mod.ERROR_SYMBOL_PROPERTY_NAME, "string");
    assertEquals(
      typeof mod.ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS,
      "string",
    );
    assertEquals(
      typeof mod.ERROR_MISSING_STATIC_OR_VALUE_ON_POLYMORPHIC_SWITCH,
      "string",
    );
    assertEquals(typeof mod.ERROR_INVALID_DATE, "string");
    assertEquals(typeof mod.ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE, "string");
    assertEquals(
      typeof mod.ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE,
      "string",
    );
    assertEquals(
      typeof mod.ERROR_TO_OBJECT_CONTAINING_USE_TO_SERIALIZE,
      "string",
    );

    assertEquals(Object.keys(mod).length, 10);
  },
});
