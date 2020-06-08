// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";

/** abstract class and revive */
export {
  Serializable,
  ReviverStrategy,
  ReplacerStrategy,
  composeReviverStrategy as composeReviveStrategy,
  composeReplacerStrategy,
} from "./serializable.ts";

/** date revivers */
export { createDateReviver, ISODateReviver } from "./revivers/date_revivers.ts";
export { defaultReplacer } from "./replacers/default_replacer.ts";
export { recursiveReplacer } from "./replacers/recursive_replacer.ts";
