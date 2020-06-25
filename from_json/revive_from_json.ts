// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJsonStrategy, Serializable } from "../serializable.ts";

export const ERROR_MESSAGE_TYPEOF_FROM_JSON = "fromJson is not a function";

/** revive data using `fromJson` on a subclass type */
export function fromJsonAs<T>(
  type: { new (): Serializable },
): FromJsonStrategy {
  return (value: T) => {
    return new type().fromJson(value);
  };
}
