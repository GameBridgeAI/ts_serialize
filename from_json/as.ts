// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJsonStrategy, Serializable } from "../serializable.ts";

/** revive data using `fromJson` on a subclass type */
export function fromJsonAs<T extends Serializable>(
  type: T & { new (): Serializable },
): FromJsonStrategy {
  return (value: T) => new type().fromJson(value);
}
