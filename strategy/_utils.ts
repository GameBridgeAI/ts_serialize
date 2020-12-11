// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";

/** for strategies */
export type NewSerializable<T> = T & (new () => Serializable);
/** for strategies */
export type FunctionSerializable = () => Serializable;

/** for strategy values */
export function isObject(obj: any): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/** for strategy type arguments */
function isNewable<T>(
  v: NewSerializable<T> | FunctionSerializable,
): v is NewSerializable<T> {
  return !!v.name;
}

/** get new strategy type arguments */
export function getNew<T>(
  type: NewSerializable<T> | FunctionSerializable,
): Serializable {
  return isNewable(type) ? new type() : type();
}
