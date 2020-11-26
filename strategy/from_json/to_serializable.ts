// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";

/** revive data using `fromJSON` on a subclass type */
export function toSerializable<T>(
  type: T & { new (): Serializable },
): FromJSONStrategy {
  return function _toSerializable(
    value: JSONValue,
  ): Serializable | Serializable[] {
    if (Array.isArray(value)) {
      return value.map((item) => new type().fromJSON(item));
    }
    return new type().fromJSON(value);
  };
}
