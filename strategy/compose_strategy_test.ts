// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
import { test } from "../test_deps.ts";
import { composeStrategy } from "./compose_strategy.ts";
import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

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
