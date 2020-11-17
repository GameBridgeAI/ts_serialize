// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "../test_deps.ts";
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
  name: "ISODateFromJson parses ISO dates - 2020-05-24T15:54:14.876Z",
  fn() {
    const testJson =
      `{"date":"2020-05-24T15:54:14.876Z","not_a_date":"Hello world"}`;
    const testObj = JSON.parse(testJson, (_, v) => ISODateFromJson(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.getFullYear(), 2020);
    assert(!(testObj.not_a_date instanceof Date));
    assertEquals(testObj.not_a_date, "Hello world");
  },
});

test({
  name: "ISODateFromJson parses ISO dates - 2020-12-31T23:00:00+01:00",
  fn() {
    const testJson =
      `{"date":"2020-12-31T23:00:00+01:00","not_a_date":"Hello world"}`;
    const testObj = JSON.parse(testJson, (_, v) => ISODateFromJson(v));
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.getFullYear(), 2020);
    assert(!(testObj.not_a_date instanceof Date));
    assertEquals(testObj.not_a_date, "Hello world");
  },
});

test({
  name: "ISODateFromJson parses ISO dates - 2020-12-31T23:00:00",
  fn() {
    const testJson =
      `{"date":"2020-12-31T23:00:00","not_a_date":"Hello world"}`;
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
    const testObj = new Test().fromJson(`{"date":"I am not a date!"}`);
    assertEquals(typeof testObj.date, "string");
    assertEquals(testObj.date, "I am not a date!");
  },
});
