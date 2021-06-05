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
    | FromJSONStrategy
    | ToJSONStrategy
  )[]
): FromJSONStrategy | ToJSONStrategy {
  return function _composeStrategy(val: any): any {
    return fns.reduce(
      (acc: any, fn: FromJSONStrategy | ToJSONStrategy) => fn(acc),
      val,
    );
  };
}
