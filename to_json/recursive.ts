// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONObject, Serializable, toPojo } from "../serializable.ts";

/** Recursively serialize a serializable class */
export function recursiveToJSON(value: Serializable): JSONObject {
  return toPojo(value);
}
