// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONArray, JSONValue, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";
import {
  ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE,
  ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE,
} from "../../error_messages.ts";
import { getNew, isObject, StrategyTypeArgument } from "../_utils.ts";

/** revive data from `{k: v}` using `fromJSON` on a subclass type `v` */
export function toObjectContaining<T>(
  type: StrategyTypeArgument<T>,
): FromJSONStrategy {
  return function _toObjectContaining(
    value: JSONValue,
  ) {
    if (value == null) {
      return null;
    }

    if (!isObject(value)) {
      throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE);
    }

    const record: Record<string, Serializable | Serializable[] | null> = {};
    // check that JSONValue is something we can deal with
    // but mostly to make the type checker happy
    if (typeof value === "object" && !Array.isArray(value)) {
      for (const prop in value) {
        // null is a JSONValue
        if (value[prop] === null) {
          record[prop] = null;
          continue;
        }

        // Serializable[]
        if (Array.isArray(value[prop])) {
          record[prop] = (value[prop] as JSONArray).map((v: JSONValue) => {
            if (!isObject(v)) {
              throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
            }
            return getNew(type).fromJSON(v);
          });
          continue;
        }

        // only process Serializable
        if (!isObject(value[prop])) {
          throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
        }

        record[prop] = getNew(type).fromJSON(value[prop]);
      }
    }
    return record;
  };
}
