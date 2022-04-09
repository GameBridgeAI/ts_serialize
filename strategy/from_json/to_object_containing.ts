// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONObject, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";
import {
  ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE,
  ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE,
} from "../../error_messages.ts";
import { isObject } from "../_utils.ts";
import { getNewSerializable } from "../utils.ts";

/** revive data from `{k: v}` using `fromJSON` on a subclass type `v` */
export function toObjectContaining(
  type: unknown,
): FromJSONStrategy {
  return (
    value: { [k: string]: JSONObject | JSONObject[] },
  ): null | Record<string, Serializable | Serializable[] | null> => {
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
          record[prop] = (value[prop] as JSONObject[]).map((v) => {
            if (!isObject(v)) {
              throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
            }
            return getNewSerializable(type).fromJSON(v);
          });
          continue;
        }

        // only process Serializable
        if (!isObject(value[prop])) {
          throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
        }

        record[prop] = getNewSerializable(type).fromJSON(
          value[prop] as JSONObject,
        );
      }
    }
    return record;
  };
}
