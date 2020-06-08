// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { toPojo } from "../serializable.ts";

export function recursiveReplacer<T>(value: any): any {
  return toPojo(value);
}
