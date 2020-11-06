// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";

/** types, isolatedModules requires this to be `export type ...` */
export type { FromJsonStrategy, ToJsonStrategy } from "./serializable.ts";

/** abstract class and and compose strategy functions */
export { composeStrategy, Serializable, TransformKey } from "./serializable.ts";

/** from json strategies */
export { fromJsonAs } from "./from_json/as.ts";
export { createDateStrategy, ISODateFromJson } from "./from_json/date.ts";
