// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assertEquals, assertStrictEq, fail } from "./test_deps.ts";
import {
  SerializePropertyOptionsMap,
  DUPLICATE_PROPERTY_KEY_ERROR_MESSAGE,
  DUPLICATE_SERIALIZE_KEY_ERROR_MESSAGE,
} from "./serialize_property_options_map.ts";
import { SerializePropertyOptions } from "./serializable.ts";

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
    const test = new SerializePropertyOptionsMap();
    const spOptions = new SerializePropertyOptions("a", "b");
    test.set(spOptions);

    assertEquals(test.hasPropertyKey("a"), true);
    assertEquals(test.hasSerializedKey("b"), true);
    assertStrictEq(test.getByPropertyKey("a"), spOptions);
    assertStrictEq(test.getBySerializedKey("b"), spOptions);

    const allPropertyOptions = Array.from(test.propertyOptions());
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

    const test = new SerializePropertyOptionsMap(testParent);

    assertEquals(test.hasPropertyKey("a"), true);
    assertEquals(test.hasSerializedKey("b"), true);
    assertStrictEq(test.getByPropertyKey("a"), spOptions);
    assertStrictEq(test.getBySerializedKey("b"), spOptions);

    const allPropertyOptions = Array.from(test.propertyOptions());
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

    const test = new SerializePropertyOptionsMap(testParent);
    const childSPOptions = new SerializePropertyOptions("a", "b");
    test.set(childSPOptions);

    assertEquals(test.hasPropertyKey("a"), true);
    assertEquals(test.hasSerializedKey("b"), true);
    assertStrictEq(test.getByPropertyKey("a"), childSPOptions);
    assertStrictEq(test.getBySerializedKey("b"), childSPOptions);

    const allPropertyOptions = Array.from(test.propertyOptions());
    assertEquals(allPropertyOptions.length, 1);
    assertEquals(allPropertyOptions[0], childSPOptions);
  },
});

test({
  name:
    "SerializePropertyOptionsMap error when trying to add a duplicate property key",
  fn() {
    const test = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("a", "b");
    const childSPOptions2 = new SerializePropertyOptions("a", "c");
    test.set(childSPOptions);
    try {
      test.set(childSPOptions2);
      fail("Shouldn't be able to set duplicate property keys");
    } catch (e) {
      assertEquals(e.message, `${DUPLICATE_PROPERTY_KEY_ERROR_MESSAGE}: a`);
    }
  },
});

test({
  name:
    "SerializePropertyOptionsMap error when trying to add a duplicate serialize key",
  fn() {
    const test = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("a", "a");
    const childSPOptions2 = new SerializePropertyOptions("b", "a");
    test.set(childSPOptions);
    try {
      test.set(childSPOptions2);
      fail("Shouldn't be able to set duplicate property keys");
    } catch (e) {
      assertEquals(e.message, `${DUPLICATE_SERIALIZE_KEY_ERROR_MESSAGE}: a`);
    }
  },
});

test({
  name:
    "SerializePropertyOptionsMap error when trying to add a duplicate property key",
  fn() {
    const test = new SerializePropertyOptionsMap();
    const childSPOptions = new SerializePropertyOptions("a", "b");
    const childSPOptions2 = new SerializePropertyOptions("a", "c");
    test.set(childSPOptions);
    try {
      test.set(childSPOptions2);
      fail("Shouldn't be able to set duplicate property keys");
    } catch (e) {
      assertEquals(e.message, `${DUPLICATE_PROPERTY_KEY_ERROR_MESSAGE}: a`);
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

    assertStrictEq(testChild.getByPropertyKey("b"), childSPOptions);
    assertStrictEq(testChild.getByPropertyKey("a"), undefined);

    assertStrictEq(testChild.hasPropertyKey("b"), true);
    assertStrictEq(testChild.hasPropertyKey("a"), false);

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

    assertStrictEq(testChild.getBySerializedKey("b"), childSPOptions);
    assertStrictEq(testChild.getBySerializedKey("a"), undefined);

    assertStrictEq(testChild.hasSerializedKey("b"), true);
    assertStrictEq(testChild.hasSerializedKey("a"), false);

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

    assertStrictEq(testChild.getByPropertyKey("b"), childSPOptions);
    assertStrictEq(testChild.getByPropertyKey("a"), childSPOptions2);

    assertStrictEq(testChild.hasPropertyKey("b"), true);
    assertStrictEq(testChild.hasPropertyKey("a"), true);

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

    assertStrictEq(testChild.getBySerializedKey("b"), childSPOptions);
    assertStrictEq(testChild.getBySerializedKey("a"), childSPOptions2);

    assertStrictEq(testChild.hasSerializedKey("b"), true);
    assertStrictEq(testChild.hasSerializedKey("a"), true);

    const childEntries = Array.from(testChild.propertyOptions());
    assertEquals(childEntries.length, 2);
    assertEquals(childEntries[0], childSPOptions);
    assertEquals(childEntries[1], childSPOptions2);
  },
});
