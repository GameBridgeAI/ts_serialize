// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONArray, JSONValue, Serializable } from "../../serializable.ts";
import { FromJSONStrategy } from "../compose_strategy.ts";

/** revive data from `{k: v}` using `fromJSON` on a subclass type `v` */
export function toObjectContaining<T>(
  type: T & { new (): Serializable },
): FromJSONStrategy {
  return function _toObjectContaining(
    value: JSONValue,
  ) {
    const record: { [_: string]: Serializable | Serializable[] } = {};
    // check that JSONValue is something we can deal with
    if (typeof value === "object" && !Array.isArray(value)) {
      for (const prop in value) {
        if (value[prop]) {
          if (Array.isArray(value[prop])) {
            record[prop] = (value[prop] as JSONArray).map((v: JSONValue) =>
              new type().fromJSON(v)
            );
          } else {
            record[prop] = new type().fromJSON(value[prop]);
          }
        }
      }
    }
    return record;
  };
}
