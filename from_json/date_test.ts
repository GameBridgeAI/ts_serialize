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
  fn() {
    const testJson = `{"date":"2020-366"}`;
    const testObj = JSON.parse(testJson, (_, v) => iso8601Date(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T00:00:00.000Z");
  },
});
