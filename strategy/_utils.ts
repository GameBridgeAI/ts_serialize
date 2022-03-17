// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { FunctionSerializable, NewSerializable } from "./utils.ts";

/** for strategy values */
export function isObject(obj: unknown): obj is Record<string, unknown> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/** for strategy type arguments */
export function isNewable<T>(
  type: unknown,
): type is NewSerializable<T> {
  return (type && typeof type === "function" && type.prototype &&
    type.prototype.constructor) === type;
}

/** for strategy type arguments */
export function isFunctionSerializable(
  type: unknown,
): type is FunctionSerializable {
  return typeof type === "function";
}
