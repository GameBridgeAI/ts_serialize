// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JsonValue } from "../serializable.ts";

/** Use the default replacer logic 
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
*/
export function defaultToJson(value: any): JsonValue {
  return value;
}
