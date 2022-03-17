// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONValue, Serializable } from "../../serializable.ts";
import { Strategy } from "../compose_strategy.ts";

/** serialize data using `tsSerialize` on a subclass Serializable type */
export function fromSerializable(): Strategy {
  return (
    value: Serializable | Serializable[],
  ): JSONValue => {
    if (Array.isArray(value)) {
      return value.map((item) => item.tsSerialize());
    }
    return value.tsSerialize();
  };
}
