// Copyright 2018-2020 ts_serialize authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "../test_deps.ts";
import { ISODateReviver } from "./date_revivers.ts";

import { Serializable, SerializeProperty } from "../mod.ts";


test({
  name: "Can revive ISO strings to Dates",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty({ reviveStrategy: ISODateReviver, useBuiltinSerializer: true})
      date = new Date("2020-06-04T22:53:46.892Z");
    }
    assertEquals(new Test().toJson(), `{"date":"2020-06-04T22:53:46.892Z"}`);
    const test = new Test().fromJson(`{"date":"2099-06-04T22:53:46.892Z"}`);
    assert(test.date instanceof Date);
    assertEquals(test.date.toJSON(), "2099-06-04T22:53:46.892Z");
  },
});

test({
  name: "Will not serialize non date strings",
  fn() {
    class Test extends Serializable<Test> {
      @SerializeProperty({ reviveStrategy: ISODateReviver, useBuiltinSerializer: true})
      date!: Date | string
    }
    const test = new Test().fromJson(`{"date":"I am not a date!"}`);
    assertEquals(typeof test.date, "string");
    assertEquals(test.date, "I am not a date!");
  },
});