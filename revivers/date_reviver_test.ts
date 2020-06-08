// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "../test_deps.ts";
import { createDateReviver, ISODateReviver } from "./date_revivers.ts";
import { Serializable, SerializeProperty } from "../mod.ts";

test({
  name: "createDateReviver creates reviver from regex",
  fn() {
    const testReviver = createDateReviver(/^(\d{4})-(\d{2})-(\d{2})$/);
    const mockJSON = `{"date":"2099-11-25","not_a_date":"Hello world"}`;
    const mockObj = JSON.parse(mockJSON, (_, v) => testReviver(v));
    assert(mockObj.date instanceof Date);
    assertEquals(mockObj.date.getFullYear(), 2099);
    assert(!(mockObj.not_a_date instanceof Date));
    assertEquals(mockObj.not_a_date, "Hello world");
  },
});

test({
  name: "ISODateReviver parses ISO dates",
  fn() {
    const mockJSON =
      `{"date":"2020-06-04T19:01:47.831Z","not_a_date":"Hello world"}`;
    const mockObj = JSON.parse(mockJSON, (_, v) => ISODateReviver(v));
    assert(mockObj.date instanceof Date);
    assertEquals(mockObj.date.getFullYear(), 2020);
    assert(!(mockObj.not_a_date instanceof Date));
    assertEquals(mockObj.not_a_date, "Hello world");
  },
});

test({
  name: "Will not serialize non date strings",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty({
        reviverStrategy: ISODateReviver,
      })
      date!: Date | string;
    }
    const test = new Test().fromJson(`{"date":"I am not a date!"}`);
    assertEquals(typeof test.date, "string");
    assertEquals(test.date, "I am not a date!");
  },
});
