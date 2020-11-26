import { polymorphicClassFromJSON, PolymorphicSwitch } from "./polymorphic.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

abstract class MyBaseClass extends Serializable {
  @SerializeProperty()
  public parentValue?: number;

  public testMethod() {
    console.log("Default logic");
  }
}

class MyPolyClassImplementation extends MyBaseClass {
  @SerializeProperty()
  public mandatoryValue?: number;
  @PolymorphicSwitch(() => new MyPolyClassImplementation())
  public static _class = "MyPolyClassImplementation";
}
// Instance property test
class MyOtherPolyClass extends MyBaseClass {
  @SerializeProperty()
  @PolymorphicSwitch(() => new MyOtherPolyClass(), "MyOtherPolyClass")
  public _class = "";

  @SerializeProperty()
  public someProperty = 33;

  public testMethod() {
    console.log("Custom logic");
  }
}

const myPolyClassInstance = polymorphicClassFromJSON(
  MyBaseClass,
  { "_class": "MyPolyClassImplementation", "parentValue": 11 },
);

const myOtherPolyClassInstance = polymorphicClassFromJSON(
  MyBaseClass,
  { "_class": "MyOtherPolyClass", "someProperty": 0, "parentValue": 22 },
);

console.log("Should be MyPolyClassImplementation: ", myPolyClassInstance);
// Should be MyPolyClass:  MyPolyClassImplementation {}

console.log("Should be myOtherPolyClassInstance: ", myOtherPolyClassInstance);
// Should be myOtherPolyClassInstance:  MyOtherPolyClass {}

console.log("=== Test full serialize ===");

const data =
  `{"_class":"MyOtherPolyClass", "someProperty": 13, "parentValue": 33}`;

const test = polymorphicClassFromJSON(MyBaseClass, data);

console.log(test);

test.testMethod();
