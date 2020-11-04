import {
  composeStrategy,
  createDateStrategy,
  fromJsonAs,
  FromJsonStrategy,
  ISODateFromJson,
  readJson,
  Serializable,
  SerializeProperty,
  ToJsonStrategy,
} from "./deps.ts";

function assert(boolean: boolean, msg?: string): void {
  if (!boolean) {
    console.error(msg || "Assertion failed");
    Deno.exit(1);
  }
}

const customStrategy = (v: string) => `${v} strategy changed`;
const fromJsonStrategy: FromJsonStrategy = (v: string) => `${v} strategy`;
const toJsonStrategy: ToJsonStrategy = (v: string) => `${v} changed`;
const customDateStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);
const toJsonFixture = await readJson("../fixtures/to.json") as Record<
  string,
  any
>;
const fromJsonFixture = await readJson("../fixtures/from.json") as Record<
  string,
  any
>;

class Nested extends Serializable {
  @SerializeProperty("sub_property")
  subProperty = "toJson";
}

class Test extends Serializable {
  notSerialized = "not serialized";

  @SerializeProperty()
  serializedPropertyNoArg = "toJson";

  @SerializeProperty("rename_test")
  renameTest = "toJson";

  @SerializeProperty({ serializedKey: "rename_test_by_property" })
  renameTestByProperty = "toJson";

  @SerializeProperty({ fromJsonStrategy: customStrategy })
  fromJsonStrategyTest = "toJson";

  @SerializeProperty({ toJsonStrategy: customStrategy })
  toJsonStrategyTest = "toJson";

  @SerializeProperty(
    {
      toJsonStrategy: composeStrategy(
        fromJsonStrategy,
        (v: string) => `${v} changed`,
      ),
      fromJsonStrategy: composeStrategy(
        (v: string) => `${v} strategy`,
        toJsonStrategy,
      ),
    },
  )
  composeStrategyTest = "toJson";

  @SerializeProperty({ fromJsonStrategy: fromJsonAs(Nested) })
  fromJsonAsTest = new Nested();

  @SerializeProperty({ fromJsonStrategy: ISODateFromJson })
  isoDate = new Date("2020-06-04T19:01:47.831Z");

  @SerializeProperty({ fromJsonStrategy: customDateStrategy })
  createDate = new Date("2099-11-25");
}
assert(new Test().toJson() === JSON.stringify(toJsonFixture), "toJson()");
const test = new Test().fromJson(fromJsonFixture);
assert(test.notSerialized === "not serialized", "notSerialized");
assert(test.serializedPropertyNoArg === "fromJson", "serializedPropertyNoArg");
assert(test.renameTest === "fromJson", "renameTest");
assert(test.renameTestByProperty === "fromJson", "renameTestByProperty");
assert(
  test.fromJsonStrategyTest === "fromJson strategy changed",
  "fromJsonStrategyTest",
);
assert(test.toJsonStrategyTest === "fromJson", "toJsonStrategyTest");
assert(
  test.composeStrategyTest === "fromJson strategy changed",
  "composeStrategyTest",
);
assert(test.fromJsonAsTest instanceof Nested, "fromJsonAsTest instanceof");
assert(
  test.fromJsonAsTest.subProperty === "fromJson",
  "fromJsonAsTest.subProperty",
);
assert(test.isoDate instanceof Date, "isoDate instanceof");
assert(test.isoDate.getFullYear() === 2020, "isoDate.getFullYear90");
assert(test.createDate instanceof Date, "createDate instanceof");
assert(test.createDate.getFullYear() === 2099, "createDate.getFullYear()");
