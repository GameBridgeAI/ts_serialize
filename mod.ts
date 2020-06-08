// Copyright 2018-2020 ts_serialize authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";

/** abstract class and revive */
export { Serializable, composeReviveStrategy, ReviverStrategy } from "./serializable.ts";

/** date revivers */
export { createDateReviver, ISODateReviver } from "./revivers/date_revivers.ts";
