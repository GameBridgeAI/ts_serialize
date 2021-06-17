// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue, Serializable } from "../../serializable.ts";

/** serialize data using `tsSerialize` on a subclass Serializable type */
export function fromSerializable(
  value: Serializable | Serializable[],
): JSONValue {
  if (Array.isArray(value)) {
    return value.map((item) => item.tsSerialize());
  }
  return value.tsSerialize();
}
