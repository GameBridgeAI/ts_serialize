// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "../test_deps.ts";
import { createDateStrategy, iso8601Date } from "./date.ts";
import { Serializable, SerializeProperty } from "../mod.ts";

test({
  name: "createDateStrategy creates strategy from regex",
  fn() {
    const dateStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);
    const testJson = `{"date":"2099-11-25"}`;
    const testObj = JSON.parse(testJson, (_, v) => dateStrategy(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.getFullYear(), 2099);
  },
});

test({
  name: "Will not serialize non date strings",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: iso8601Date,
      })
      date!: Date | string;
    }
    const testObj = new Test().fromJson(`{"date":"I am not a date!"}`);
    assertEquals(typeof testObj.date, "string");
    assertEquals(testObj.date, "I am not a date!");
  },
});

test({
  name: "iso8601Date parses with milliseconds - 2020-12-31T12:00:00.300Z",
  fn() {
    const testJson = `{"date":"2020-12-31T12:00:00.300Z"}`;
    const testObj = JSON.parse(testJson, (_, v) => iso8601Date(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.300Z");
  },
});

test({
  name: "iso8601Date parses without milliseconds - 2020-12-31T12:00:00Z",
  fn() {
    const testJson = `{"date":"2020-12-31T12:00:00"}`;
    const testObj = JSON.parse(testJson, (_, v) => iso8601Date(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.000Z");
  },
});

test({
  name: "iso8601Date parses with added timezone - 2020-12-31T12:00:00Z-6",
  fn() {
    const testJson = `{"date":"2020-12-31T06:00:00Z-6"}`;
    const testObj = JSON.parse(testJson, (_, v) => iso8601Date(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.000Z");
  },
});

test({
  name: "iso8601Date parses time without `T` - 2020-06-29 12:00:00Z",
  fn() {
    const testJson = `{"date":"2020-12-31 12:00:00Z"}`;
    const testObj = JSON.parse(testJson, (_, v) => iso8601Date(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.000Z");
  },
});

test({
  name: "iso8601Date parses `2020-366` - leap year",
  only: true,
  fn() {
    const testJson = `{"date":"2020-366"}`;
    const testObj = JSON.parse(testJson, (_, v) => iso8601Date(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T00:00:00.000Z");
  },
});

for (
  const { testDate, value } of [
    { value: "2005-01-01T00:00:00.000Z", testDate: "2004-W53-6" },
    { value: "2005-01-02T00:00:00.000Z", testDate: "2004-W53-7" },
    { value: "2005-12-31T00:00:00.000Z", testDate: "2005-W52-6" },
    { value: "2006-01-01T00:00:00.000Z", testDate: "2005-W52-7" },
    { value: "2006-01-02T00:00:00.000Z", testDate: "2006-W01-1" },
    { value: "2006-12-31T00:00:00.000Z", testDate: "2006-W52-7" },
    { value: "2007-01-01T00:00:00.000Z", testDate: "2007-W01-1" },
    { value: "2007-12-30T00:00:00.000Z", testDate: "2007-W52-7" },
    { value: "2007-12-31T00:00:00.000Z", testDate: "2008-W01-1" },
    { value: "2008-01-01T00:00:00.000Z", testDate: "2008-W01-2" },
    { value: "2008-12-28T00:00:00.000Z", testDate: "2008-W52-7" },
    { value: "2008-12-29T00:00:00.000Z", testDate: "2009-W01-1" },
    { value: "2008-12-30T00:00:00.000Z", testDate: "2009-W01-2" },
    { value: "2008-12-31T00:00:00.000Z", testDate: "2009-W01-3" },
    { value: "2009-01-01T00:00:00.000Z", testDate: "2009-W01-4" },
    { value: "2009-12-31T00:00:00.000Z", testDate: "2009-W53-4" },
    { value: "2010-01-01T00:00:00.000Z", testDate: "2009-W53-5" },
    { value: "2010-01-02T00:00:00.000Z", testDate: "2009-W53-6" },
    { value: "2010-01-03T00:00:00.000Z", testDate: "2009-W53-7" },
  ]
) {
  test({
    name: `iso8601Date parses "${testDate}" as "${value}"`,
    ignore: true,
    fn() {
      const testJson = `{"date":"${testDate}"}`;
      const testObj = JSON.parse(testJson, (_, v) => iso8601Date(v));
      assert(testObj.date instanceof Date);
      assertEquals(testObj.date.toISOString(), value);
    },
  });
}
