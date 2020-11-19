// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJsonStrategy, JsonValue } from "../serializable.ts";

/** allows authors to pass a regex to parse as a date */
export function createDateStrategy(regex: RegExp): FromJsonStrategy {
  return function _createDateStrategy(input: JsonValue): Date {
    if (typeof input !== "string" || !regex.exec(input)) {
      throw new Error("invalid date");
    }
    return new Date(input);
  };
}

/** Test a string for a ISO 8601 Date */
export function iso8601Date(input: JsonValue): any {
  /** a provided regex to deal with iso formats
   * @example 2008-08-30T01:45:36
   * @example 2008-08-30T01:45:36.123Z
   * @see https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s07.html
   * 
   * We are accepting timezones but will depend on `Date.UTC`
   */
  const iso =
    //        <year>              -    <month>    -         <day>   <T non optional> <hour>:    <minute>:    <second>    <.milli> <Z  or `-+timezone`>
    /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/;

  if (typeof input !== "string" || !iso.exec(input)) {
    throw new Error("Invalid date");
  }

  /** the result array. first in the list is the full pattern
   * @example 2020-12-31T12:00:00.300Z
   * @capture ["2020-12-31T12:00:00.300Z","2020","12","31","12","00","00",".300","Z]
   * @mapped [ 2020, 12, 31, 12, 0, 0, 0.3 ]
   */
  let [
    ,
    // skipping the full pattern match above
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
  ] = iso.exec(input)?.map(Number) || [];

  if (Number.isNaN(year)) {
    throw new Error("Invalid date");
  }

  if (Number.isNaN(month)) {
    month = 1;
  }
  if (Number.isNaN(day)) {
    day = 0;
  }
  if (Number.isNaN(hour)) {
    hour = 0;
  }
  if (Number.isNaN(minute)) {
    minute = 0;
  }
  if (Number.isNaN(second)) {
    second = 0;
  }
  if (Number.isNaN(millisecond)) {
    millisecond = 0;
  }

  return new Date(Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    millisecond * 1000,
  ));
}
