// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "@std/assert";
import { getNewSerializable } from "./utils.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

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
