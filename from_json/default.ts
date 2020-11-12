// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JsonValue } from "../serializable.ts";

/** typed function */
export function defaultFromJson(value: JsonValue): any {
  return value;
}
