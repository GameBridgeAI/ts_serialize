// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { toPojo, Serializable, JsonObject } from "../serializable.ts";

/** Recursively serialize a serializable class */
export function recursiveToJson(value: Serializable): JsonObject {
  return toPojo(value);
}
