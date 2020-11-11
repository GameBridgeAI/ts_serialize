// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJsonStrategy, JsonValue } from "../serializable.ts";

/** allows authors to pass a regex to parse as a date */
export function createDateStrategy(regex: RegExp): FromJsonStrategy {
  return function _createDateStrategy(value: JsonValue): any | Date {
    return typeof value === "string" && regex.exec(value)
      ? new Date(value)
      : value;
  };
}

/** Changed from
 * @see https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates
 */
export const ISODateFromJson = createDateStrategy(
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/,
);
