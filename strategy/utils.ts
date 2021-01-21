// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";
import { isNewable } from "./_utils.ts";

export type NewSerializable<T> = T & (new () => Serializable);
type FunctionSerializable = () => Serializable;
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
  return isNewable(type) ? new type() : type();
}
