// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";
import { isNewable } from "./_utils.ts";

export type NewSerializable<T> = T & (new () => Serializable);
export type FunctionSerializable = () => Serializable;

/** get new strategy type arguments */
export function getNew<T>(
  type: NewSerializable<T> | FunctionSerializable,
): Serializable {
  return isNewable(type) ? new type() : type();
}
