// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, fail, test } from "../test_deps.ts";
import { createDateStrategy, iso8601Date } from "./date.ts";
import { Serializable, SerializeProperty } from "../mod.ts";

test({
  name: "createDateStrategy - creates strategy from regex",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
      })
      date!: Date;
    }
    const testObj = new Test().fromJson({ "date": "1990-11-11" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "1990-11-11T00:00:00.000Z");
  },
});

test({
  name: "createDateStrategy - Timezones applied by string types",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: createDateStrategy(/^(\d{4})\/(\d{2})\/(\d{2})$/),
      })
      date!: Date;
    }
    const testObj = new Test().fromJson({ "date": "1990/11/11" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "1990-11-11T05:00:00.000Z");
    assertEquals(testObj.date.getTime(), new Date(1990, 10, 11).getTime());
  },
});

test({
  name: "Will not serialize non date strings",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: iso8601Date,
      })
      date!: Date;
    }
    try {
      new Test().fromJson(`{"date":"I am not a date!"}`);
      fail("Non date string did not error");
    } catch (error) {
      assertEquals(error.message, "Invalid date");
    }
  },
});

test({
  name: "iso8601Date parses with milliseconds - 2020-12-31T12:00:00.300Z",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: iso8601Date,
      })
      public date!: Date;
    }
    const testObj = new Test().fromJson({ "date": "2020-12-31T12:00:00.300Z" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.300Z");
  },
});

test({
  name: "iso8601Date parses without milliseconds - 2020-12-31T12:00:00Z",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: iso8601Date,
      })
      public date!: Date;
    }
    const testObj = new Test().fromJson({ "date": "2020-12-31T12:00:00Z" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.000Z");
  },
});

test({
  name: "iso8601Date parses with added timezone - 2020-12-31T00:00:00-05:00",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJsonStrategy: iso8601Date,
      })
      public date!: Date;
    }
    const testObj = new Test().fromJson(
      { "date": "2020-12-31T00:00:00-05:00" },
    );
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T00:00:00.000Z");
  },
});
