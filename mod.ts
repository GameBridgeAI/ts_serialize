// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** This module is browser compatible. */

/** property decorator */
export { SerializeProperty } from "./serialize_property.ts";
/** types */
export type { TransformKey } from "./serializable.ts";
/** abstract class */
export { Serializable } from "./serializable.ts";
/** strategy helper */
export { composeStrategy } from "./strategy/compose_strategy.ts";
/** types */
export type {
  FromJSONStrategy,
  ToJSONStrategy,
} from "./strategy/compose_strategy.ts";
/** from json strategies */
export { toSerializable } from "./strategy/from_json/to_serializable.ts";
export { toObjectContaining } from "./strategy/from_json/to_object_containing.ts";
export { fromObjectContaining } from "./strategy/to_json/from_object_containing.ts";
export { createDateStrategy, iso8601Date } from "./strategy/from_json/date.ts";
/** polymorphic classes */
export {
  polymorphicClassFromJSON,
  PolymorphicResolver,
  PolymorphicSwitch,
} from "./polymorphic.ts";
/** types */
export type { InitializerFunction, ResolverFunction } from "./polymorphic.ts";
