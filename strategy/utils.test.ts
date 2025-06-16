// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { fail } from "@std/assert/fail";
import { assert } from "@std/assert";
import { assertEquals } from "@std/assert/equals";

import { getNewSerializable } from "./utils.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";
import { ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED } from "../error_messages.ts";

Deno.test({
  name: "getNewSerializable takes a function that returns a Serializable",
  fn() {
    class A extends Serializable {
      @SerializeProperty()
      public test: string;
      constructor({ test = "" }: Partial<A>) {
        super();
        this.test = test;
      }
    }

    assertEquals(
      getNewSerializable(() => new A({ test: "from_constructor" })).toJSON(),
      `{"test":"from_constructor"}`,
    );
  },
});

Deno.test({
  name: "getNewSerializable takes a Serializable",
  fn() {
    class A extends Serializable {
      @SerializeProperty()
      public test = "not_from_constructor";
    }

    assertEquals(
      getNewSerializable(A).toJSON(),
      `{"test":"not_from_constructor"}`,
    );
  },
});

Deno.test({
  name: "getNewSerializable returns an Error if not a Serializable",
  fn() {
    class A {
      public test = "not_from_constructor";
    }

    try {
      getNewSerializable(A);
      fail("Expected getNewSerializable error to be thrown");
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(
        e.message,
        ERROR_GET_NEW_SERIALIZABLE_SERIALIZABLE_NOT_RETURNED,
      );
    }
  },
});
