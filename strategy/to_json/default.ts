// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue } from "../../serializable.ts";

/** Use the default replacer logic
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
*/
export function toJSONDefault(value: any): JSONValue {
  return value;
}
