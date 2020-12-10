// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONArray, JSONValue, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";
import {
  ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE,
  ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE,
  ERROR_TO_OBJECT_CONTAINING_USE_TO_SERIALIZABLE,
} from "../../error_messages.ts";

function isObject(obj: any): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/** revive data from `{k: v}` using `fromJSON` on a subclass type `v` */
export function toObjectContaining<T>(
  type: T & { new (): Serializable },
): FromJSONStrategy {
  return function _toObjectContaining(
    value: JSONValue,
  ) {
    if (value == null) {
      return null;
    }

    if (Array.isArray(value)) {
      throw new Error(ERROR_TO_OBJECT_CONTAINING_USE_TO_SERIALIZABLE);
    }

    if (!isObject(value)) {
      throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE);
    }

    const record: Record<string, Serializable | Serializable[] | null> = {};
    // check that JSONValue is something we can deal with
    // but mostly to make the type checker happy
    if (typeof value === "object") {
      for (const prop in value) {
        // null is a JSONValue
        if (value[prop] === null) {
          record[prop] = null;
          continue;
        }

        if (Array.isArray(value[prop])) {
          record[prop] = (value[prop] as JSONArray).map((v: JSONValue) => {
            if (!isObject(v)) {
              throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
            }
            return new type().fromJSON(v);
          });
          continue;
        }

        if (!isObject(value[prop])) {
          throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
        }

        record[prop] = new type().fromJSON(value[prop]);
      }
    }
    return record;
  };
}
