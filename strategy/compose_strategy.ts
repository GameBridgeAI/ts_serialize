// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
import { JSONValue } from "../serializable.ts";

/** Functions used when hydrating data */
export type FromJSONStrategy = (value: JSONValue) => any;
export type FromJSONStrategyArgument =
  (FromJSONStrategy | FromJSONStrategy[])[];

/** Functions used when dehydrating data */
export type ToJSONStrategy = (value: any) => JSONValue;
export type ToJSONStrategyArgument = (ToJSONStrategy | ToJSONStrategy[])[];
/** Function to build a `fromJSONStrategy` or `toJSONStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns:
    | FromJSONStrategyArgument
    | ToJSONStrategyArgument
): FromJSONStrategy | ToJSONStrategy {
  return function _composeStrategy(val: any): any {
    return fns.flat().reduce(
      (acc: any, fn: FromJSONStrategy | ToJSONStrategy) => fn(acc),
      val,
    );
  };
}
