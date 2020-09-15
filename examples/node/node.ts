import {
  Serializable,
  SerializeProperty,
  composeStrategy,
  fromJsonAs,
  FromJsonStrategy,
  ToJsonStrategy,
  ISODateFromJson,
  createDateStrategy,
} from "@gamebridgeai/ts_serialize";

import toJsonFixture from "../fixtures/to.json";
import fromJsonFixture from "../fixtures/from.json";
const customStrategy = (v: string) => `${v} strategy changed`;
const fromJsonStrategy: FromJsonStrategy = (v: string) => `${v} strategy`;
const toJsonStrategy: ToJsonStrategy = (v: string) => `${v} changed`;
const customDateStrategy = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/);

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
console.assert(
  new Test().toJson() === JSON.stringify(toJsonFixture),
);
const test = new Test().fromJson(fromJsonFixture);
console.assert(test.notSerialized === "not serialized");
console.assert(test.serializedPropertyNoArg === "fromJson");
console.assert(test.renameTest === "fromJson");
console.assert(test.renameTestByProperty === "fromJson");
console.assert(test.fromJsonStrategyTest === "fromJson strategy changed");
console.assert(test.toJsonStrategyTest === "fromJson");
console.assert(test.composeStrategyTest === "fromJson strategy changed");
console.assert(test.fromJsonAsTest instanceof Nested);
console.assert(test.fromJsonAsTest.subProperty === "fromJson");
console.assert(test.isoDate instanceof Date);
console.assert(test.isoDate.getFullYear() === 2020);
console.assert(test.createDate instanceof Date);
console.assert(test.createDate.getFullYear() === 2099);
