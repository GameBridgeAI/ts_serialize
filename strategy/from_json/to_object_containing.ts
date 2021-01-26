// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONArray, JSONValue, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";
import {
  ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE,
  ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE,
} from "../../error_messages.ts";
import { isObject } from "../_utils.ts";
import { getNewSerializable, SerializableConstructor } from "../utils.ts";

/** revive data from `{k: v}` using `fromJSON` on a subclass type `v` */
export function toObjectContaining<T>(
  type: SerializableConstructor<T>,
): FromJSONStrategy {
  return function _toObjectContaining(
    object: JSONValue,
  ) {
    if (object == null) {
      return null;
    }

    if (!isObject(object)) {
      throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_VALUE);
    }

    if (!Array.isArray(object)) {
      return Object.entries(object).reduce((acc, [key, value]) => {
        if (value == null) {
          acc[key] = null;
        } else if (Array.isArray(value)) {
          acc[key] = value.map((v: JSONValue) => {
            if (!isObject(v)) {
              throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
            }
            return getNewSerializable(type).fromJSON(v);
          });
        } else if (!isObject(value)) {
          throw new Error(ERROR_TO_OBJECT_CONTAINING_INVALID_SUB_VALUE);
        } else {
          acc[key] = getNewSerializable(type).fromJSON(value);
        }
        return acc;
      }, {} as Record<string, Serializable | Serializable[] | null>);
    }
    return {};
  };
}
