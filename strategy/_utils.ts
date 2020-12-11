// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";

type NewSerializable<T> = T & (new () => Serializable);
type FunctionSerializable = () => Serializable;
/** for strategies */
export type StrategyTypeArgument<T> = NewSerializable<T> | FunctionSerializable;

/** for strategy values */
export function isObject(obj: any): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/** for strategy type arguments */
function isNewable<T>(
  type: NewSerializable<T> | FunctionSerializable,
): type is NewSerializable<T> {
  return (type && typeof type === "function" && type.prototype &&
    type.prototype.constructor) === type;

  // return !!type.name;
}

/** get new strategy type arguments */
export function getNew<T>(
  type: NewSerializable<T> | FunctionSerializable,
): Serializable {
  return isNewable(type) ? new type() : type();
}
