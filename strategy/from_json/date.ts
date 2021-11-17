// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { FromJSONStrategy } from "../compose_strategy.ts";
import { JSONValue } from "../../serializable.ts";
import { ERROR_INVALID_DATE } from "../../error_messages.ts";

/** allows authors to pass a regex to parse as a date */
export function createDateStrategy(regex: RegExp): FromJSONStrategy {
  return (input: JSONValue): Date => {
    if (typeof input !== "string" || !regex.exec(input)) {
      throw new Error(ERROR_INVALID_DATE);
    }
    const date = new Date(input);
    if (date.toJSON() === null) {
      throw new Error(ERROR_INVALID_DATE);
    }
    return date;
  };
}

/** Test a string for a ISO 8601 Date */
export function iso8601Date(): FromJSONStrategy {
  return (input: JSONValue): Date => {
    /** a provided regex to deal with iso formats
     * @example 2008-08-30T01:45:36
     * @example 2008-08-30T01:45:36.123Z
     * @see https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s07.html
     */
    const iso =
      //        <year>              -    <month>    -         <day>   <T non optional> <hour>:    <minute>:    <second>    <.milli> <Z  or `-+timezone`>
      /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/;
    if (typeof input !== "string" || !iso.exec(input)) {
      throw new Error(ERROR_INVALID_DATE);
    }
    return new Date(input);
  };
}
