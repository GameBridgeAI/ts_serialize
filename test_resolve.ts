import {
  PolymorphicResolver,
  serializePolymorphicClass,
} from "./polymorphic.ts";
import { JsonValue, Serializable } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";

abstract class MyBaseClass extends Serializable {
  @SerializeProperty()
  public parentValue?: number;

  public testMethod() {
    console.log("Default logic");
  }
  // Property name can be whatever, even an inaccessible symbol
  @PolymorphicResolver
  public static [Symbol()](
    input: string | JsonValue | Object,
  ): Serializable {
    const inputObject = typeof input === "string" ? JSON.parse(input) : input;

    switch (inputObject._class) {
      case "MyPolyClassImplementation":
        return new MyPolyClassImplementation();
      case "MyOtherPolyClass":
        return new MyOtherPolyClass();
      default:
        throw new Error(
          `Unable to determine polymorphic class type ${inputObject._class}`,
        );
    }
  }
}

class MyPolyClassImplementation extends MyBaseClass {
  public static _class = "MyPolyClassImplementation";
}

class MyOtherPolyClass extends MyBaseClass {
  public static _class = "MyOtherPolyClass";
}

const myPolyClassInstance = serializePolymorphicClass(
  MyBaseClass,
  { "_class": MyPolyClassImplementation._class },
);

const myOtherPolyClassInstance = serializePolymorphicClass(
  MyBaseClass,
  { "_class": MyOtherPolyClass._class },
);

console.log("Should be MyPolyClassImplementation: ", myPolyClassInstance);
// Should be MyPolyClass:  MyPolyClassImplementation {}

console.log("Should be MyOtherPolyClass: ", myOtherPolyClassInstance);
// Should be myOtherPolyClassInstance:  MyOtherPolyClass {}

console.log("=== Test full serialize ===");

const data =
  `{"_class":"MyOtherPolyClass", "someProperty": 13, "parentValue": 33}`;

const test = serializePolymorphicClass(MyBaseClass, data);

console.log(test);

test.testMethod();
