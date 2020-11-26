// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJSONStrategy, JSONValue, Serializable } from "../serializable.ts";

/** revive data using `fromJSON` on a subclass type */
export function fromJSONAs<T>(
  type: T & { new (): Serializable },
): FromJSONStrategy {
  return function _fromJSONAs(
    value: JSONValue,
  ): Serializable | Serializable[] {
    if (Array.isArray(value)) {
      return value.map((item) => new type().fromJSON(item));
    }
    return new type().fromJSON(value);
  };
}
