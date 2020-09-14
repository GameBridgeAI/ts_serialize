// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";

/** abstract class and and compose strategy functions */
export {
  Serializable,
  FromJsonStrategy,
  ToJsonStrategy,
  composeStrategy,
} from "./serializable.ts";

/** from json strategies */
export { fromJsonAs } from "./from_json/as.ts";
export {
  createDateStrategy,
  ISODateFromJson,
} from "./from_json/date.ts";

/** to json strategies */
export { defaultToJson } from "./to_json/default.ts";
export { recursiveToJson } from "./to_json/recursive.ts";
