// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, fail, test } from "../../test_deps.ts";
import { createDateStrategy, iso8601Date } from "./date.ts";
import { Serializable, SerializeProperty } from "../../mod.ts";
import { ERROR_INVALID_DATE } from "../../error_messages.ts";

test({
  name: "createDateStrategy - creates strategy from regex",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
      })
      date!: Date;
    }
    const testObj = new Test().fromJSON({ "date": "1990-11-11" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "1990-11-11T00:00:00.000Z");
  },
});

test({
  name: "createDateStrategy - Will not deserialize non date strings",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
      })
      date!: Date;
    }
    try {
      new Test().fromJSON(`{"date":"I am not a date!"}`);
      fail("Non date string did not error");
    } catch (error) {
      assertEquals(error.message, ERROR_INVALID_DATE);
    }
  },
});

test({
  name: "iso8601Date - Will not deserialize non date strings",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      date!: Date;
    }
    try {
      new Test().fromJSON(`{"date":"I am not a date!"}`);
      fail("Non date string did not error");
    } catch (error) {
      assertEquals(error.message, ERROR_INVALID_DATE);
    }
  },
});

test({
  name: "iso8601Date parses with milliseconds - 2020-12-31T12:00:00.300Z",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      public date!: Date;
    }
    const testObj = new Test().fromJSON({ "date": "2020-12-31T12:00:00.300Z" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.300Z");
  },
});

test({
  name: "iso8601Date parses without milliseconds - 2020-12-31T12:00:00Z",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      public date!: Date;
    }
    const testObj = new Test().fromJSON({ "date": "2020-12-31T12:00:00Z" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.000Z");
  },
});

test({
  name: "iso8601Date parses with added timezone - 2020-12-31T00:00:00-07:00",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      public date!: Date;
    }
    const testObj = new Test().fromJSON(
      { "date": "2020-12-31T00:00:00-07:00" },
    );
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T07:00:00.000Z");
  },
});

test({
  name: "createDateStrategy - throws on invalid dates",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: createDateStrategy(/^Im going to shoot my foot$/),
      })
      date!: Date;
    }
    try {
      new Test().fromJSON(`{"date":"Im going to shoot my foot"}`);
      fail("Non date string did not error");
    } catch (error) {
      assertEquals(error.message, ERROR_INVALID_DATE);
    }
  },
});
