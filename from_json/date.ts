// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { FromJsonStrategy, JsonValue } from "../serializable.ts";

/** allows authors to pass a regex to parse as a date */
export function createDateStrategy(regex: RegExp): FromJsonStrategy {
  return function _createDateStrategy(value: any): any | Date {
    return typeof value === "string" && regex.exec(value)
      ? new Date(value)
      : value;
  };
}

/** converts timezone to minutes */
function parseTimezone(zone: number): number {
  return zone * 60 - Number.parseInt(`-${new Date().getTimezoneOffset()}`);
}

interface IsoWeekDate {
  year: number;
  week: number;
  weekday: number;
  timezone: number;
}

function isoWeekDate({ year, week, weekday, timezone }: IsoWeekDate): Date {
  const date = new Date(year, 0, 4, 0, 0 - timezone, 0, 0);
  return date;
}

/** Test a string for a full ISO 8601 Date */
export function iso8601Date(input: JsonValue): any {
  var iso =
    /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/;
  // throw error on bad data?
  if (typeof input !== "string" || !iso.exec(input)) {
    return input;
  }
  // first match is the whole pattern which we do not need `,` skips it
  let [
      ,
      year,
      week,
      weekday,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      zone,
    ] = input.match(iso)?.map(Number) || [],
    timezone = parseTimezone(0);

  console.log(year, day);

  if (Number.isNaN(year)) {
    return input;
  }

  if (!Number.isNaN(zone)) {
    timezone = parseTimezone(zone);
  }

  /** @todo (shardyMBAI) weekday calendar formats */
  if (!Number.isNaN(week) && !Number.isNaN(weekday)) {
    return input;
    // return isoWeekDate({ year, week, weekday, timezone });
  }

  if (Number.isNaN(month)) {
    month = 1;
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

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute - timezone,
    second,
    millisecond,
  );
}
