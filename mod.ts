// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";

/** abstract class and revive */
export {
  Serializable,
  FromJsonStrategy,
  ToJsonStrategy,
  composeFromJsonStrategy as fromJsonStrategy,
  composeToJsonStrategy as toJsonStrategy,
} from "./serializable.ts";

/** date revivers */
export {
  createDateStrategy,
  ISODateFromJson,
} from "./from_json/date_from_json.ts";
export { defaultToJson } from "./to_json/default_to_json.ts";
export { recursiveToJson } from "./to_json/recursive_to_json.ts";
