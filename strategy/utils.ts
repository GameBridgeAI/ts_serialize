// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";
import { isFunctionSerializable, isNewable } from "./_utils.ts";
import { ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED } from "../error_messages.ts";

export type NewSerializable<T> = T & (new () => Serializable);
export type FunctionSerializable = () => Serializable;
/** get new strategy type arguments */
export function getNewSerializable(type: unknown): Serializable {
  const isNewableType = isNewable(type);
  if (isNewableType && type.prototype instanceof Serializable) {
    return new type();
  } else if (!isNewableType && isFunctionSerializable(type)) {
    const instance = type();
    if (instance instanceof Serializable) {
      return instance;
    }
  }

  throw new Error(ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED);
}
