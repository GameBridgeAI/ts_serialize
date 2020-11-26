// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";

/** types, isolatedModules requires this to be `export type ...` */
export type {
  FromJSONStrategy,
  ToJSONStrategy,
  TransformKey,
} from "./serializable.ts";

/** abstract class and and compose strategy functions */
export { composeStrategy, Serializable } from "./serializable.ts";

/** from json strategies */
export { as } from "./from_json/as.ts";
export { createDateStrategy, iso8601Date } from "./from_json/date.ts";
