// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONObject, JSONValue, Serializable } from "../../serializable.ts";

export function fromObjectContaining(
  value: Record<string, Serializable | Serializable[]>,
): JSONObject {
  const record: Record<string, JSONValue> = {};
  for (const prop in value) {
    record[prop] = Array.isArray(value[prop])
      ? (value[prop] as Serializable[]).map((v) => v.tsSerialize())
      : (value[prop] as Serializable).tsSerialize();
  }

  return record;
}
