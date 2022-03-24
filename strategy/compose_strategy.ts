// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue } from "../serializable.ts";

/** Functions used when hydrating data. While we do know that the incoming param
 * is a JSONValue, this forces authors using the library to recast the known
 * type before using it. By using any they can cast it in the function
 * signature */
// deno-lint-ignore no-explicit-any
export type FromJSONStrategy = (value: any) => any;

/** Functions used when dehydrating data */
// deno-lint-ignore no-explicit-any
export type ToJSONStrategy = (value: any) => JSONValue;

/** Function to build a `fromJSONStrategy` or `toJSONStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns: (FromJSONStrategy | ToJSONStrategy)[]
): FromJSONStrategy | ToJSONStrategy {
  return (
    // deno-lint-ignore no-explicit-any
    val: any,
  ): JSONValue | unknown => fns.reduce((acc, fn) => fn(acc), val);
}
