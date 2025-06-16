// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals } from "@std/assert";
import * as mod from "./error_messages.ts";

Deno.test({
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
    assertEquals(typeof mod.ERROR_INVALID_DATE, "string");
    assertEquals(typeof mod.ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE, "string");
    assertEquals(
      typeof mod.ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE,
      "string",
    );
    assertEquals(
      typeof mod.ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED,
      "string",
    );
    assertEquals(Object.keys(mod).length, 9);
  },
});
