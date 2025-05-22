// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals } from "@std/assert";
import { Serializable } from "../../serializable.ts";
import {
  SerializeProperty,
  SerializePropertyArgument,
} from "../../serialize_property.ts";
import { fromSerializable } from "./from_serializable.ts";

function FromSerializable(propertyName?: string): PropertyDecorator {
  const opts: SerializePropertyArgument = {
    toJSONStrategy: fromSerializable(),
  };
  if (propertyName) {
    opts.serializedKey = propertyName;
  }
  return SerializeProperty(opts);
}

Deno.test({
  name: "fromSerializable - arrays of nested objects",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      public serializeMe = 999;
    }
    class Test2 extends Serializable {
      @FromSerializable("outer_property")
      public nested: Test1[] = [new Test1()];
    }

    class Test3 extends Serializable {
      @FromSerializable("outer_outer_property")
      public nested2: Test2[] = [new Test2()];
    }
    const testObj = new Test3();

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":[{"outer_property":[{"nested_property":999}]}]}`,
    );
  },
});

Deno.test({
  name:
    "fromSerializable - arrays of nested objects with an object set to null",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      public serializeMe = 999;
    }
    class Test2 extends Serializable {
      @FromSerializable("outer_property")
      public nested: Test1[] | null = [new Test1()];
    }

    class Test3 extends Serializable {
      @FromSerializable("outer_outer_property")
      public nested2: Test2[] | null = [new Test2()];
    }
    const testObj = new Test3();
    testObj.nested2 = null;

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":null}`,
    );
  },
});

Deno.test({
  name: "fromSerializable - single serializable objects",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      public serializeMe = 999;
    }
    class Test2 extends Serializable {
      @FromSerializable("outer_property")
      public nested: Test1 = new Test1();
    }

    class Test3 extends Serializable {
      @FromSerializable("outer_outer_property")
      public nested2: Test2 = new Test2();
    }
    const testObj = new Test3();

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":{"outer_property":{"nested_property":999}}}`,
    );
  },
});

Deno.test({
  name:
    "fromSerializable - single serializable objects with an object set to null",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      public serializeMe = 999;
    }
    class Test2 extends Serializable {
      @FromSerializable("outer_property")
      public nested: Test1 | null = new Test1();
    }

    class Test3 extends Serializable {
      @FromSerializable("outer_outer_property")
      public nested2: Test2 | null = new Test2();
    }

    const testObj = new Test3();
    testObj.nested2 = null;

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":null}`,
    );
  },
});

Deno.test({
  name: "fromSerializable - arrays of null",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      public serializeMe = 999;
    }
    class Test2 extends Serializable {
      @FromSerializable("outer_property")
      public nested: (Test1 | null)[] = [null, new Test1(), null];
    }

    class Test3 extends Serializable {
      @FromSerializable("outer_outer_property")
      public nested2: (Test2 | null)[] = [null, new Test2(), null];
    }
    const testObj = new Test3();

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":[null,{"outer_property":[null,{"nested_property":999},null]},null]}`,
    );
  },
});
