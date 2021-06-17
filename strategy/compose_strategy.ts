// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { JSONValue } from "../serializable.ts";

/** Functions used when hydrating data */
export type FromJSONStrategy = (value: JSONValue) => any;

/** Functions used when dehydrating data */
export type ToJSONStrategy = (value: any) => JSONValue;

/** Function to build a `fromJSONStrategy` or `toJSONStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns: (
    | ToJSONStrategy
    | FromJSONStrategy
  )[]
): FromJSONStrategy | ToJSONStrategy {
  return function _composeStrategy(
    val: any,
  ): unknown {
    return fns.reduce((acc, fn) => fn(acc), val);
  };
}
