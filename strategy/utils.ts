// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { Serializable } from "../serializable.ts";
import { FunctionSerializable, isNewable, NewSerializable } from "./_utils.ts";

/** get new strategy type arguments */
export function getNew<T>(
  type: NewSerializable<T> | FunctionSerializable,
): Serializable {
  return isNewable(type) ? new type() : type();
}
