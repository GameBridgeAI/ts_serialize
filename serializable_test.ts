// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { assert, assertEquals, test } from "./test_deps.ts";
import { composeStrategy, Serializable } from "./serializable.ts";

test({
  name: "adds methods to extended classes",
  fn() {
    class TestClass extends Serializable {}
    const testObj = new TestClass();
    assert(testObj instanceof Serializable);
    assertEquals(typeof testObj.toJson, "function");
    assertEquals(typeof testObj.fromJson, "function");
  },
});

test({
  name: "composeStrategy composes a List of functions",
  fn() {
    const addLetter = (letter: string) => (v: string) => `${v}${letter}`;
    const shout = (v: string) => `${v}!!!`;
    const strategy = composeStrategy(
      addLetter(" "),
      addLetter("W"),
      addLetter("o"),
      addLetter("r"),
      addLetter("l"),
      addLetter("d"),
      shout,
    );
    assertEquals(strategy("Hello"), "Hello World!!!");
  },
});
