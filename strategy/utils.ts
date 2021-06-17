// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";
import { isCallable, isNewable } from "./_utils.ts";
import { ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED } from "../error_messages.ts";

export type NewSerializable<T> = T & (new () => Serializable);
export type FunctionSerializable = () => Serializable;
/** for strategies can be a provided function
 * returning a `new` constructed type or
 * a raw type to be constructed  */
export type SerializableConstructor<T> =
  | NewSerializable<T>
  | FunctionSerializable;

/** get new strategy type arguments */
export function getNewSerializable<T>(
  type: SerializableConstructor<T>,
): Serializable {
  if (isNewable(type)) {
    return new type();
  } else if (isCallable(type)) {
    return type();
  }
  throw new Error(ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED);
}
