// @ts-ignore
import { Serializable, SerializeProperty } from "./ts_serialize/index.js";

class Test extends Serializable {
  @SerializeProperty()
  testName = "toJson";
}
// @ts-ignore
console.log(new Test().toJson());
// @ts-ignore
console.log(new Test().fromJson(`{"testName":"fromJson"}`));
