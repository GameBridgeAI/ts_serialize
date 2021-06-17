// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";
import { isFunctionSerializable, isNewable } from "./_utils.ts";
import { ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED } from "../error_messages.ts";

export type NewSerializable<T> = T & (new () => Serializable);
export type FunctionSerializable = () => Serializable;
/** get new strategy type arguments */
export function getNewSerializable(
  type: unknown,
): Serializable {
  if (isNewable(type)) {
    return new type();
  } else if (isFunctionSerializable(type)) {
    return type();
  }
  throw new Error(ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED);
}
