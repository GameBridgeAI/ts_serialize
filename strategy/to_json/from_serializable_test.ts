// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, test } from "../../test_deps.ts";
import { Serializable } from "../../serializable.ts";
import {
  SerializeProperty,
  SerializePropertyArgument,
} from "../../serialize_property.ts";
import { fromSerializable } from "./from_serializable.ts";

function FromSerializable(
  propertyName?: string,
): PropertyDecorator {
  const opts: SerializePropertyArgument = {
    toJSONStrategy: fromSerializable(),
  };
  if (propertyName) {
    opts.serializedKey = propertyName;
  }
  return SerializeProperty(opts);
}

test({
  name: "fromSerializable - arrays of nested objects",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      serializeMe = 999;
    }
    class Test2 extends Serializable {
      @FromSerializable("outer_property")
      nested: Test1[] = [new Test1()];
    }

    class Test3 extends Serializable {
      @FromSerializable("outer_outer_property")
      nested2: Test2[] = [new Test2()];
    }
    const testObj = new Test3();

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":[{"outer_property":[{"nested_property":999}]}]}`,
    );
  },
});

test({
  name: "fromSerializable - single serializable objects",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("nested_property")
      serializeMe = 999;
    }
    class Test2 extends Serializable {
      @FromSerializable("outer_property")
      nested: Test1 = new Test1();
    }

    class Test3 extends Serializable {
      @FromSerializable("outer_outer_property")
      nested2: Test2 = new Test2();
    }
    const testObj = new Test3();

    assertEquals(
      testObj.toJSON(),
      `{"outer_outer_property":{"outer_property":{"nested_property":999}}}`,
    );
  },
});
