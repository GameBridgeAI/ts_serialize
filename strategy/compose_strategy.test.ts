// Copyright 2018-2025 Gamebridge.ai authors. All rights reserved. MIT license.
import { assertEquals } from "../deps_test.ts";
import { composeStrategy } from "./compose_strategy.ts";

Deno.test({
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
