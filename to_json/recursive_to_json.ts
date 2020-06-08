// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { toPojo, Serializable } from "../serializable.ts";

/** Recursively serialize a serializable class */
export function recursiveToJson<T>(value: Serializable<T>): any {
  return toPojo(value);
}
