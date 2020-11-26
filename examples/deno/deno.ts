import {
  as,
  composeStrategy,
  createDateStrategy,
  FromJSONStrategy,
  iso8601Date,
  readJSON,
  Serializable,
  SerializeProperty,
  ToJSONStrategy,
  TransformKey,
} from "./deps.ts";

function assert(boolean: boolean, msg?: string): void {
  if (!boolean) {
    console.error(msg || "Assertion failed");
    Deno.exit(1);
  }
}

const customStrategy = (v: string) => `${v} strategy changed`;
const fromJSONStrategy: FromJSONStrategy = (v: string) => `${v} strategy`;
const toJSONStrategy: ToJSONStrategy = (v: string) => `${v} changed`;
const customDateStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);
const toJSONFixture = await readJSON("../fixtures/to.json") as Record<
  string,
  any
>;
const fromJSONFixture = await readJSON("../fixtures/from.json") as Record<
  string,
  any
>;

class Nested extends Serializable {
  @SerializeProperty("sub_property")
  subProperty = "toJSON";
}

class Test extends Serializable {
  notSerialized = "not serialized";

  @SerializeProperty()
  serializedPropertyNoArg = "toJSON";

  @SerializeProperty("rename_test")
  renameTest = "toJSON";

  @SerializeProperty({ serializedKey: "rename_test_by_property" })
  renameTestByProperty = "toJSON";

  @SerializeProperty({ fromJSONStrategy: customStrategy })
  fromJSONStrategyTest = "toJSON";

  @SerializeProperty({ toJSONStrategy: customStrategy })
  toJSONStrategyTest = "toJSON";

  @SerializeProperty(
    {
      toJSONStrategy: composeStrategy(
        fromJSONStrategy,
        (v: string) => `${v} changed`,
      ),
      fromJSONStrategy: composeStrategy(
        (v: string) => `${v} strategy`,
        toJSONStrategy,
      ),
    },
  )
  composeStrategyTest = "toJSON";

  @SerializeProperty({ fromJSONStrategy: as(Nested) })
  asTest = new Nested();

  @SerializeProperty({ fromJSONStrategy: iso8601Date })
  isoDate = new Date("2020-06-04T19:01:47.831Z");

  @SerializeProperty({ fromJSONStrategy: customDateStrategy })
  createDate = new Date("2099-11-25");
}
assert(new Test().toJSON() === JSON.stringify(toJSONFixture), "toJSON()");
const test = new Test().fromJSON(fromJSONFixture);
assert(test.notSerialized === "not serialized", "notSerialized");
assert(test.serializedPropertyNoArg === "fromJSON", "serializedPropertyNoArg");
assert(test.renameTest === "fromJSON", "renameTest");
assert(test.renameTestByProperty === "fromJSON", "renameTestByProperty");
assert(
  test.fromJSONStrategyTest === "fromJSON strategy changed",
  "fromJSONStrategyTest",
);
assert(test.toJSONStrategyTest === "fromJSON", "toJSONStrategyTest");
assert(
  test.composeStrategyTest === "fromJSON strategy changed",
  "composeStrategyTest",
);
assert(test.asTest instanceof Nested, "asTest instanceof");
assert(
  test.asTest.subProperty === "fromJSON",
  "asTest.subProperty",
);
assert(test.isoDate instanceof Date, "isoDate instanceof");
assert(test.isoDate.getFullYear() === 2020, "isoDate.getFullYear()");
assert(test.createDate instanceof Date, "createDate instanceof");
assert(test.createDate.getFullYear() === 2099, "createDate.getFullYear()");

class TestTransformKey extends Serializable implements TransformKey {
  public tsTransformKey(key: string): string {
    return `__${key}__`;
  }
}

class TestTransformKey2 extends TestTransformKey {
  @SerializeProperty()
  public test2 = "test2";
}

class TestTransformKey3 extends TestTransformKey2 implements TransformKey {
  public tsTransformKey(key: string): string {
    return `--${key}--`;
  }
  @SerializeProperty()
  public test3 = "test3";
}

class TestTransformKey4 extends TestTransformKey3 {
  @SerializeProperty()
  public test4 = "test4";
}

assert(new TestTransformKey2().toJSON() === `{"__test2__":"test2"}`);
assert(
  new TestTransformKey2().fromJSON({ __test2__: "changed" }).test2 ===
    `changed`,
);

assert(
  new TestTransformKey3().toJSON() ===
    `{"__test2__":"test2","--test3--":"test3"}`,
);
assert(
  new TestTransformKey3().fromJSON({ "--test3--": "changed" }).test3 ===
    `changed`,
);

assert(
  new TestTransformKey4().toJSON() ===
    `{"__test2__":"test2","--test3--":"test3","--test4--":"test4"}`,
);
assert(
  new TestTransformKey4().fromJSON({ "--test4--": "changed" }).test4 ===
    `changed`,
);
