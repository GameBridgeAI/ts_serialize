// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue, Serializable } from "../../serializable.ts";
import { ToJSONStrategy } from "../compose_strategy.ts";

/** serialize data using `tsSerialize` on a subclass Serializable type */
export function fromSerializable(): ToJSONStrategy {
  return (value: Serializable | Serializable[]): JSONValue => {
    if (Array.isArray(value)) {
      return value.map((item) => item.tsSerialize());
    }
    // Objects can be null, return them without further serialization.
    // Double cast required to return a JSONValue
    return value ? value.tsSerialize() : value as null as JSONValue;
  };
}
