// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { fail } from "@std/assert/fail";
import { assert } from "@std/assert";
import { assertEquals } from "@std/assert/equals";

import { createDateStrategy, iso8601Date } from "./date.ts";
import { Serializable, SerializeProperty } from "../../mod.ts";
import { ERROR_INVALID_DATE } from "../../error_messages.ts";

Deno.test({
  name: "createDateStrategy - creates strategy from regex",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
      })
      public date!: Date;
    }
    const testObj = new Test().fromJSON({ date: "1990-11-11" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "1990-11-11T00:00:00.000Z");
  },
});

Deno.test({
  name: "createDateStrategy - Will not deserialize non date strings",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
      })
      public date!: Date;
    }
    try {
      new Test().fromJSON(`{"date":"I am not a date!"}`);
      fail("Non date string did not error");
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.message, ERROR_INVALID_DATE);
    }
  },
});

Deno.test({
  name: "iso8601Date - Will not deserialize non date strings",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      public date!: Date;
    }
    try {
      new Test().fromJSON(`{"date":"I am not a date!"}`);
      fail("Non date string did not error");
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.message, ERROR_INVALID_DATE);
    }
  },
});

Deno.test({
  name: "iso8601Date parses with milliseconds - 2020-12-31T12:00:00.300Z",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      public date!: Date;
    }
    const testObj = new Test().fromJSON({ date: "2020-12-31T12:00:00.300Z" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.300Z");
  },
});

Deno.test({
  name: "iso8601Date parses without milliseconds - 2020-12-31T12:00:00Z",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      public date!: Date;
    }
    const testObj = new Test().fromJSON({ date: "2020-12-31T12:00:00Z" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T12:00:00.000Z");
  },
});

Deno.test({
  name: "iso8601Date parses with added timezone - 2020-12-31T00:00:00-07:00",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: iso8601Date(),
      })
      public date!: Date;
    }
    const testObj = new Test().fromJSON({ date: "2020-12-31T00:00:00-07:00" });
    assert(testObj.date instanceof Date);
    assertEquals(testObj.date.toISOString(), "2020-12-31T07:00:00.000Z");
  },
});

Deno.test({
  name: "createDateStrategy - throws on invalid dates",
  fn() {
    class Test extends Serializable {
      @SerializeProperty({
        fromJSONStrategy: createDateStrategy(/^Im going to shoot my foot$/),
      })
      public date!: Date;
    }
    try {
      new Test().fromJSON(`{"date":"Im going to shoot my foot"}`);
      fail("Non date string did not error");
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.message, ERROR_INVALID_DATE);
    }
  },
});
