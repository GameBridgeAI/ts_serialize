// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { test, assert, assertEquals } from "./test_deps.ts";
import { Serializable, composeStrategy } from "./serializable.ts";

test({
  name: "adds methods to extended classes",
  fn() {
    class TestClass extends Serializable<TestClass> {}
    const test = new TestClass();
    assert(test instanceof Serializable);
    assertEquals(typeof test.toJson, "function");
    assertEquals(typeof test.fromJson, "function");
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
