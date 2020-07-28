import { Serializable, SerializeProperty } from "ts_serialize";

class Test extends Serializable {
  @SerializeProperty()
  testName = "toJson";
}

console.log(new Test().toJson());
console.log(new Test().fromJson(`{"testName":"fromJson"}`));
