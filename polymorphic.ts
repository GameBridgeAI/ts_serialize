// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  JSONValue,
  Serializable,
  SERIALIZABLE_CLASS_MAP,
} from "./serializable.ts";
import {
  ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS,
  ERROR_MISSING_STATIC_OR_VALUE_ON_POLYMORPHIC_SWITCH,
} from "./error_messages.ts";

/** Polymorphic class deserializer
 * 
 * There are currently 2 ways of doing polymorphic deserialization:
 * 1. Manually using @PolymorphicResolver on a static method on the parent class
 * 
 * This works by keeping a map of target 'parent' classes to resolver functions.
 * These are set when a static method is annotated with @PolymorphicResolver.
 * You can then call `serializePolymorphicClass` with the parent class and an 
 * input the input is passed to whatever the corresponding resolver function,
 * which will make a determination and returns an instance of a 'child' class
 * 
 * 2. Implicitly using @PolymorphicSwitch on a static or instance property on a child class.
 * 
 * This works by getting the decorated class' parent prototype and creating a map
 * for a specific class, property key, and value combination to the provided 
 * initializer function
 */

/** @PolymorphicResolver method decorator */
export function PolymorphicResolver(
  target: unknown,
  propertyKey: string | symbol,
): void {
  registerPolymorphicResolver(
    target,
    (target as Record<typeof propertyKey, () => Serializable>)[
      propertyKey as string
    ],
  );
}

export type ResolverFunction = (
  json: string | JSONValue | Object,
) => Serializable;

/** Map of class constructors to functions that take in a JSON input and output a class instance that inherits Serializable */
const POLYMORPHIC_RESOLVER_MAP = new Map<unknown, ResolverFunction>();

/** Adds a class and a resolver function to the resolver map */
function registerPolymorphicResolver(
  classPrototype: unknown,
  resolver: ResolverFunction,
): void {
  POLYMORPHIC_RESOLVER_MAP.set(classPrototype, resolver);
}

/** @PolymorphicSwitch property decorator
 * Note: This will only create de-serializer logic for the target class' direct parent class
 */
export function PolymorphicSwitch(
  initializerFunction: InitializerFunction,
  value: unknown,
): PropertyDecorator {
  return function _PolymorphicSwitch(
    target: Object, // The class it's self
    propertyKey: string | symbol,
  ) {
    registerPolymorphicSwitch(
      Object.getPrototypeOf(target.constructor), // Parent's prototype
      propertyKey,
      value,
      initializerFunction,
    );
  };
}

export type InitializerFunction = () => Serializable;
/** Parent constructor -> property key -> value -> initializer */
const POLYMORPHIC_SWITCH_MAP = new Map<
  unknown,
  Map<string | symbol, Map<unknown, InitializerFunction>>
>();

/** Add an initializer function or a specific combination of parent prototype, property key, and value */
function registerPolymorphicSwitch(
  parentPrototype: unknown,
  propertyKey: string | symbol,
  propertyValue: unknown,
  initializerFunction: InitializerFunction,
): void {
  // Get map for parent prototype, or initialize if it doesn't exist
  let classMap = POLYMORPHIC_SWITCH_MAP.get(parentPrototype);
  if (!classMap) {
    POLYMORPHIC_SWITCH_MAP.set(parentPrototype, new Map());
    classMap = POLYMORPHIC_SWITCH_MAP.get(parentPrototype);
  }

  // Get map for property key, or initialize if it doesn't exist
  let propertyKeyMap = classMap?.get(propertyKey);
  if (!propertyKeyMap) {
    classMap?.set(propertyKey, new Map());
    propertyKeyMap = classMap?.get(propertyKey);
  }

  // Add value to initializer mapping
  propertyKeyMap?.set(propertyValue, initializerFunction);
}

/** Uses either the polymorphic resolver or the polymorphic switch resolver to determine the
 * appropriate class, then deserialize the input using Serializable#fromJSON, returning the result
 */
export function polymorphicClassFromJSON<T extends Serializable>(
  classPrototype: Object & { prototype: T },
  input: string | JSONValue | Object,
): T {
  return resolvePolymorphicClass(classPrototype, input).fromJSON(input);
}

/** Calls the polymorphic resolver or polymorphic switch resolver for the provided class prototype
 * and input, and returns the initialized child class. Throws an exception if no class can be resolved
 */
function resolvePolymorphicClass<T extends Serializable>(
  classPrototype: Object & { prototype: T },
  json: string | JSONValue | Object,
): T {
  const classResolver = POLYMORPHIC_RESOLVER_MAP.get(classPrototype);
  if (classResolver) {
    return classResolver(json) as T;
  }

  const resolvedClass = resolveSwitchMap(classPrototype, json);

  if (resolvedClass) {
    return resolvedClass as T;
  }

  throw new Error(ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS);
}

/** Return a resolved class type by checking the value of a property key */
function resolveSwitchMap(
  classPrototype: unknown,
  json: string | JSONValue | Object,
): Serializable | null {
  const classMap = POLYMORPHIC_SWITCH_MAP.get(classPrototype);

  if (!classMap) {
    throw new Error(ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS);
  }

  const _json = typeof json === "string" ? JSON.parse(json) : json;

  for (const [propertyKey, valueMap] of classMap.entries()) {
    for (const [propertyValue, initializer] of valueMap.entries()) {
      // Get the serialized key relative to the property key for the initialized class, and compare that to the property value
      const initialized = initializer();

      const classMap = SERIALIZABLE_CLASS_MAP.get(
        Object.getPrototypeOf(initialized),
      );

      if (!classMap) {
        continue;
      }

      const serializedKey = classMap.getByPropertyKey(propertyKey)
        ?.serializedKey;

      if (serializedKey && propertyValue === _json[serializedKey]) {
        return initialized;
      }
    }
  }

  // Return null if no child could be matched to this value
  return null;
}
