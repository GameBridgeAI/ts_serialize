// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

/** Functions used when hydrating data */
// deno-lint-ignore no-explicit-any
export type Strategy = (value: any) => any;

/** Function to build a `fromJSONStrategy` or `toJSONStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns: Strategy[]
): Strategy {
  return (
    val: unknown,
  ): unknown => fns.reduce((acc, fn) => fn(acc), val);
}
