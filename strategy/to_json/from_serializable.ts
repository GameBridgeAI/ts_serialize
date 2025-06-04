// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue, Serializable } from "../../serializable.ts";
import { ToJSONStrategy } from "../compose_strategy.ts";

/** serialize data using `tsSerialize` on a subclass Serializable type */
export function fromSerializable(): ToJSONStrategy {
  return (value: (Serializable | null)[] | null): JSONValue => {
    if (Array.isArray(value)) {
      return value.map((item) => item ? item.tsSerialize() : item);
    }
    return value;
  };
}
