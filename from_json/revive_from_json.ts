// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJsonStrategy } from "../serializable.ts";

export const ERROR_MESSAGE_TYPEOF_FROM_JSON = "fromJson is not a function";

/** revive data using `fromJson` on a subclass type */
export function fromJsonAs<T>(type: T): FromJsonStrategy {
  return (value: T) => {
    if (typeof (type as any).prototype.fromJson !== "function") {
      throw new Error(ERROR_MESSAGE_TYPEOF_FROM_JSON);
    }
    return new (type as any)().fromJson(value);
  };
}
