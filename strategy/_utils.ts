// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  FunctionSerializable,
  NewSerializable,
  SerializableConstructor,
} from "./utils.ts";

/** for strategy values */
export function isObject(obj: any): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/** for strategy type arguments */
export function isNewable<T>(
  type: SerializableConstructor<T>,
): type is NewSerializable<T> {
  return (type && typeof type === "function" && type.prototype &&
    type.prototype.constructor) === type;
}

/** for strategy type arguments */
export function isCallable<T>(
  type: SerializableConstructor<T>,
): type is FunctionSerializable {
  return typeof type === "function";
}
