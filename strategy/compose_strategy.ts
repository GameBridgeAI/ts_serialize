// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.
// import { JSONValue } from "../serializable.ts";

/** Functions used when hydrating data */
// deno-lint-ignore no-explicit-any
export type Strategy = (value: any) => any;

/** Functions used when dehydrating data */
/// deno-lint-ignore no-explicit-any
// export type ToJSONStrategy = (value: any) => JSONValue;

/** Function to build a `fromJSONStrategy` or `toJSONStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns: Strategy[]
): Strategy {
  return (
    /// deno-lint-ignore no-explicit-any
    val: unknown,
  ): unknown => fns.reduce((acc, fn) => fn(acc), val);
}
