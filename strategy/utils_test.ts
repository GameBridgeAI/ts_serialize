// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { test } from "../test_deps.ts";
import { getNew } from "./utils.ts";
import { assertEquals } from "../test_deps.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

test({
  name: "getNew takes a function that returns a Serializable",
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
      getNew(
        () => new A({ test: "from_constructor" }),
      ).toJSON(),
      `{"test":"from_constructor"}`,
    );
  },
});

test({
  name: "getNew takes a Serializable",
  fn() {
    class A extends Serializable {
      @SerializeProperty()
      public test = "not_from_constructor";
    }

    assertEquals(
      getNew(A).toJSON(),
      `{"test":"not_from_constructor"}`,
    );
  },
});
