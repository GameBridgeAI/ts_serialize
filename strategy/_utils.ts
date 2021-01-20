// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { FunctionSerializable, NewSerializable } from "./utils.ts";

/** for strategies */
export type StrategyTypeArgument<T> = NewSerializable<T> | FunctionSerializable;

/** for strategy values */
export function isObject(obj: any): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/** for strategy type arguments */
export function isNewable<T>(
  type: NewSerializable<T> | FunctionSerializable,
): type is NewSerializable<T> {
  return (type && typeof type === "function" && type.prototype &&
    type.prototype.constructor) === type;
}
