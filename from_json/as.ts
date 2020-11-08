// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  FromJsonStrategy,
  JsonObject,
  JsonValue,
  Serializable,
} from "../serializable.ts";

/** revive data using `fromJson` on a subclass type */
export function fromJsonAs<T>(
  type: T & { new (): Serializable },
): FromJsonStrategy {
  return (value: T) => {
    if (Array.isArray(value)) {
      return value.map((item) => new type().fromJson(item));
    }
    return new type().fromJson(value);
  };
}
