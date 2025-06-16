// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { type JSONObject, type Serializable, toPojo } from "../../serializable.ts";

/** Recursively serialize a serializable class */
export function toJSONRecursive(value: Serializable): JSONObject {
  return toPojo(value);
}
