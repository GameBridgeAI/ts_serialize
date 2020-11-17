// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJsonStrategy } from "../serializable.ts";

/** allows authors to pass a regex to parse as a date */
export function createDateStrategy(regex: RegExp): FromJsonStrategy {
  return function _createDateStrategy(value: any): any | Date {
    return typeof value === "string" && regex.exec(value)
      ? new Date(value)
      : value;
  };
}

/** RegExp to test a string for a full ISO 8601 Date
 *  YYYY-MM-DDThh:mm:ss
 *  YYYY-MM-DDThh:mm:ssTZD
 *  YYYY-MM-DDThh:mm:ss.sTZD
 * @see: https://www.w3.org/TR/NOTE-datetime
 * @type {RegExp}
 */
export const ISODateFromJson = createDateStrategy(
  /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i,
);
