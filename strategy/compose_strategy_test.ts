// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.
import { test } from "../test_deps.ts";
import { composeStrategy } from "./compose_strategy.ts";
import { assertEquals } from "../test_deps.ts";

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
