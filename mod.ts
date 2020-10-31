// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";

export type { FromJsonStrategy, ToJsonStrategy } from "./serializable.ts";

/** abstract class and and compose strategy functions */
export {
  Serializable,
  composeStrategy,
} from "./serializable.ts";

/** from json strategies */
export { fromJsonAs } from "./from_json/as.ts";
export { createDateStrategy, ISODateFromJson } from "./from_json/date.ts";
