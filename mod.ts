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
export { createDateReviver, ISODateReviver } from "./revivers/date_revivers.ts";
export { defaultReplacer } from "./replacers/default_replacer.ts";
export { recursiveReplacer } from "./replacers/recursive_replacer.ts";
