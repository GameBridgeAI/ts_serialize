// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { assertEquals, assertStrictEquals, fail, test } from "./test_deps.ts";
import {
  SerializePropertyOptionsMap,
} from "./serialize_property_options_map.ts";
import { SerializePropertyOptions } from "./serialize_property.ts";
import {
  ERROR_DUPLICATE_PROPERTY_KEY,
  ERROR_DUPLICATE_SERIALIZE_KEY,
} from "./error_messages.ts";

test({
  name: "SerializePropertyOptionsMap correctly initializes",
  fn() {
    new SerializePropertyOptionsMap();
  },
});

test({
  name:
    "SerializePropertyOptionsMap setting a property correctly sets both keys",
  fn() {
    const testObj = new SerializePropertyOptionsMap();
    const spOptions = new SerializePropertyOptions("a", "b");
    testObj.set(spOptions);

    assertEquals(testObj.hasPropertyKey("a"), true);
    assertEquals(testObj.hasSerializedKey("b"), true);
    assertStrictEquals(testObj.getByPropertyKey("a"), spOptions);
    assertStrictEquals(testObj.getBySerializedKey("b"), spOptions);

    const allPropertyOptions = Array.from(testObj.propertyOptions());
    assertEquals(allPropertyOptions.length, 1);
    assertEquals(allPropertyOptions[0], spOptions);
  },
});

test({
  name: "SerializePropertyOptionsMap parent properties are correctly retained",
  fn() {
    const testParent = new SerializePropertyOptionsMap();
    const spOptions = new SerializePropertyOptions("a", "b");
    testParent.set(spOptions);

    const testObj = new SerializePropertyOptionsMap(testParent);

    assertEquals(testObj.hasPropertyKey("a"), true);
    assertEquals(testObj.hasSerializedKey("b"), true);
    assertStrictEquals(testObj.getByPropertyKey("a"), spOptions);
    assertStrictEquals(testObj.getBySerializedKey("b"), spOptions);

    const allPropertyOptions = Array.from(testObj.propertyOptions());
    assertEquals(allPropertyOptions.length, 1);
    assertEquals(allPropertyOptions[0], spOptions);
  },
});

test({
  name: "SerializePropertyOptionsMap can properly override a parent property",
  fn() {
    const testParent = new SerializePropertyOptionsMap();
    const parentSPOptions = new SerializePropertyOptions("a", "b");
    testParent.set(parentSPOptions);

    const testObj = new SerializePropertyOptionsMap(testParent);
    const childSPOptions = new SerializePropertyOptions("a", "b");
    testObj.set(childSPOptions);

    assertEquals(testObj.hasPropertyKey("a"), true);
    assertEquals(testObj.hasSerializedKey("b"), true);
    assertStrictEquals(testObj.getByPropertyKey("a"), childSPOptions);
    assertStrictEquals(testObj.getBySerializedKey("b"), childSPOptions);

    const allPropertyOptions = Array.from(testObj.propertyOptions());
    assertEquals(allPropertyOptions.length, 1);
    assertEquals(allPropertyOptions[0], childSPOptions);
  },
});

test({
  name:
    "SerializePropertyOptionsMap error when trying to add a duplicate property key",
  fn() {
    const testObj = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("a", "b");
    const childSPOptions2 = new SerializePropertyOptions("a", "c");
    testObj.set(childSPOptions);
    try {
      testObj.set(childSPOptions2);
      fail("Shouldn't be able to set duplicate property keys");
    } catch (e) {
      assertEquals(e.message, `${ERROR_DUPLICATE_PROPERTY_KEY}: a`);
    }
  },
});

test({
  name:
    "SerializePropertyOptionsMap error when trying to add a duplicate serialize key",
  fn() {
    const testObj = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("a", "a");
    const childSPOptions2 = new SerializePropertyOptions("b", "a");
    testObj.set(childSPOptions);
    try {
      testObj.set(childSPOptions2);
      fail("Shouldn't be able to set duplicate property keys");
    } catch (e) {
      assertEquals(e.message, `${ERROR_DUPLICATE_SERIALIZE_KEY}: a`);
    }
  },
});

test({
  name:
    "SerializePropertyOptionsMap parent property key is ignored if overridden by a new child property",
  fn() {
    const testParent = new SerializePropertyOptionsMap();
    const parentSPOptions = new SerializePropertyOptions("a", "a");
    testParent.set(parentSPOptions);

    const testChild = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("b", "a");
    testChild.set(childSPOptions);

    assertStrictEquals(testChild.getByPropertyKey("b"), childSPOptions);
    assertStrictEquals(testChild.getByPropertyKey("a"), undefined);

    assertStrictEquals(testChild.hasPropertyKey("b"), true);
    assertStrictEquals(testChild.hasPropertyKey("a"), false);

    const childEntries = Array.from(testChild.propertyOptions());
    assertEquals(childEntries.length, 1);
    assertEquals(childEntries[0], childSPOptions);
  },
});

test({
  name:
    "SerializePropertyOptionsMap parent serialize key is ignored if overridden by a new child property",
  fn() {
    const testParent = new SerializePropertyOptionsMap();
    const parentSPOptions = new SerializePropertyOptions("a", "a");
    testParent.set(parentSPOptions);

    const testChild = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("a", "b");
    testChild.set(childSPOptions);

    assertStrictEquals(testChild.getBySerializedKey("b"), childSPOptions);
    assertStrictEquals(testChild.getBySerializedKey("a"), undefined);

    assertStrictEquals(testChild.hasSerializedKey("b"), true);
    assertStrictEquals(testChild.hasSerializedKey("a"), false);

    const childEntries = Array.from(testChild.propertyOptions());
    assertEquals(childEntries.length, 1);
    assertEquals(childEntries[0], childSPOptions);
  },
});

test({
  name:
    "SerializePropertyOptionsMap can access child object property if replacing an ignored parent property key",
  fn() {
    const testParent = new SerializePropertyOptionsMap();
    const parentSPOptions = new SerializePropertyOptions("a", "a");
    testParent.set(parentSPOptions);

    const testChild = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("b", "a");
    testChild.set(childSPOptions);
    const childSPOptions2 = new SerializePropertyOptions("a", "c");
    testChild.set(childSPOptions2);

    assertStrictEquals(testChild.getByPropertyKey("b"), childSPOptions);
    assertStrictEquals(testChild.getByPropertyKey("a"), childSPOptions2);

    assertStrictEquals(testChild.hasPropertyKey("b"), true);
    assertStrictEquals(testChild.hasPropertyKey("a"), true);

    const childEntries = Array.from(testChild.propertyOptions());
    assertEquals(childEntries.length, 2);
    assertEquals(childEntries[0], childSPOptions);
    assertEquals(childEntries[1], childSPOptions2);
  },
});

test({
  name:
    "SerializePropertyOptionsMap an access child object property if replacing an ignored parent serialized key",
  fn() {
    const testParent = new SerializePropertyOptionsMap();
    const parentSPOptions = new SerializePropertyOptions("a", "a");
    testParent.set(parentSPOptions);

    const testChild = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("a", "b");
    testChild.set(childSPOptions);
    const childSPOptions2 = new SerializePropertyOptions("c", "a");
    testChild.set(childSPOptions2);

    assertStrictEquals(testChild.getBySerializedKey("b"), childSPOptions);
    assertStrictEquals(testChild.getBySerializedKey("a"), childSPOptions2);

    assertStrictEquals(testChild.hasSerializedKey("b"), true);
    assertStrictEquals(testChild.hasSerializedKey("a"), true);

    const childEntries = Array.from(testChild.propertyOptions());
    assertEquals(childEntries.length, 2);
    assertEquals(childEntries[0], childSPOptions);
    assertEquals(childEntries[1], childSPOptions2);
  },
});
