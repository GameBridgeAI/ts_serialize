// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
import { JSONValue } from "../serializable.ts";

/** typed function */
export function defaultFromJSON(value: JSONValue): any {
  return value;
}
