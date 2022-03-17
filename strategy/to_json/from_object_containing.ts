// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { JSONObject, JSONValue, Serializable } from "../../serializable.ts";
import { Strategy } from "../compose_strategy.ts";

/** convert `{ [_: string]: Serializable }` to `{ [_: string]: Serializable.tsSerialize() }` */
export function fromObjectContaining(): Strategy {
  return (
    value: Record<string, Serializable | Serializable[]>,
  ): JSONObject => {
    const record: Record<string, JSONValue> = {};
    for (const [prop, obj] of Object.entries(value)) {
      record[prop] = Array.isArray(obj)
        ? obj.map((v) => v.tsSerialize())
        : obj.tsSerialize();
    }

    return record;
  };
}
