// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONObject, Serializable } from "../../serializable.ts";

/** convert `{ [_: string]: Serializable }` to `{ [_: string]: Serializable.toSerialize() }` */
export function fromObjectContaining(
  value: Record<string, Serializable | Serializable[]>,
): JSONObject {
  return Object.entries(value).reduce((acc, [key, value]) => {
    acc[key] = Array.isArray(value)
      ? value.map((v) => v.tsSerialize())
      : value.tsSerialize();
    return acc;
  }, {} as JSONObject);
}
