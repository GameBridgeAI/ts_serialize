// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "../test_deps.ts";
import { createDateStrategy, ISODateFromJson } from "./date.ts";
import { Serializable, SerializeProperty } from "../mod.ts";

test({
  name: "createDateStrategy creates strategy from regex",
  fn() {
    const dateStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);
    const testJson = `{"date":"2099-11-25","not_a_date":"Hello world"}`;
    const testObj = JSON.parse(testJson, (_, v) => dateStrategy(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.getFullYear(), 2099);
    assert(!(testObj.not_a_date instanceof Date));
    assertEquals(testObj.not_a_date, "Hello world");
  },
});

test({
  name: "ISODateFromJson parses ISO dates",
  fn() {
    const testJson =
      `{"date":"2020-06-04T19:01:47.831Z","not_a_date":"Hello world"}`;
    const testObj = JSON.parse(testJson, (_, v) => ISODateFromJson(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.getFullYear(), 2020);
    assert(!(testObj.not_a_date instanceof Date));
    assertEquals(testObj.not_a_date, "Hello world");
  },
});

test({
  name: "Will not serialize non date strings",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: ISODateFromJson,
      })
      date!: Date | string;
    }
    const test = new Test().fromJson(`{"date":"I am not a date!"}`);
    assertEquals(typeof test.date, "string");
    assertEquals(test.date, "I am not a date!");
  },
});
