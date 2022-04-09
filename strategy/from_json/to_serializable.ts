// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONObject, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";
import { getNewSerializable } from "../utils.ts";

/** revive data using `fromJSON` on a subclass type */
export function toSerializable(
  type: unknown,
): FromJSONStrategy {
  return (
    value: string | JSONObject,
  ): Serializable | Serializable[] => {
    if (Array.isArray(value)) {
      return value.map((item) => getNewSerializable(type).fromJSON(item));
    }
    return getNewSerializable(type).fromJSON(value);
  };
}
