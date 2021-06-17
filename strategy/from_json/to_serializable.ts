// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";
import { getNewSerializable } from "../utils.ts";

/** revive data using `fromJSON` on a subclass type */
export function toSerializable<T>(
  type: unknown,
): FromJSONStrategy {
  return function _toSerializable(
    value: JSONValue,
  ): Serializable | Serializable[] {
    if (Array.isArray(value)) {
      return value.map((item) => getNewSerializable(type).fromJSON(item));
    }
    return getNewSerializable(type).fromJSON(value);
  };
}
