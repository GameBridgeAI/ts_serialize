// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { JsonValue, Serializable } from "../serializable.ts";

/*
 * Polymorphic class deserializer
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

// @PolymorphicResolver method decorator
export function PolymorphicResolver(
  target: unknown, // Target class
  propertyKey: string | symbol, // The name of the static method
) {
  registerPolymorphicResolver(
    target,
    (target as Record<typeof propertyKey, () => Serializable>)[
      propertyKey as string
    ],
  );
}

export type ResolverFunction = (
  input: string | JsonValue | Object,
) => Serializable;

/** Map of class constructors to functions that take in a JSON input and output a class instance that inherits Serializable */
const POLYMORPHIC_RESOLVER_MAP = new Map<unknown, ResolverFunction>();

/**
 * Adds a class and a resolver function to the resolver map
 */
function registerPolymorphicResolver(
  classPrototype: unknown,
  resolver: ResolverFunction,
): void {
  POLYMORPHIC_RESOLVER_MAP.set(classPrototype, resolver);
}

/**
 * @PolymorphicSwitch property decorator
 * Note: This will only create de-serializer logic for the target class' direct parent class
 */
export function PolymorphicSwitch(
  initializerFunction: InitializerFunction,
  value?: string,
): PropertyDecorator {
  return (
    target: Function | Object, // The constructor of the class for static properties, and the class it's self for instance properties
    propertyKey: string | symbol,
  ) => {
    // Assert property should be static
    if (!Object.prototype.hasOwnProperty.call(target, propertyKey) && !value) {
      throw new Error(
        `${target.toString()} doesn't have own property ${
          String(propertyKey)
        }, or no value provided`,
      );
    }

    let targetConstructor = target;

    if (typeof target !== "function") {
      targetConstructor = target.constructor;
    }

    const parentPrototype = Object.getPrototypeOf(targetConstructor);

    // BUG: propertyKey can also be symbol, but typescript/deno throws an error due to https://github.com/microsoft/TypeScript/issues/1863
    const propertyValue = (target as Record<typeof propertyKey, unknown>)[
      (propertyKey as string)
    ] || value;

    registerPolymorphicSwitch(
      parentPrototype,
      propertyKey,
      propertyValue,
      initializerFunction,
    );
  };
}

export type InitializerFunction = () => Serializable;
/**
 * Parent constructor -> property key -> value -> initializer
 */
const POLYMORPHIC_SWITCH_MAP = new Map<
  unknown,
  Map<string | symbol, Map<unknown, InitializerFunction>>
>();

/**
 * Add an initializer function or a specific combination of parent prototype, property key, and value
 */
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
  console.log(propertyKey, propertyValue);
  // Add value to initializer mapping
  propertyKeyMap?.set(propertyValue, initializerFunction);
}

/**
 * Uses either the polymorphic resolver or the polymorphic switch resolver to determine the
 * appropriate class, then deserialize the input using Serializable#fromJSON, returning the result
 */
export function polymorphicClassFromJSON<T extends Serializable>(
  classPrototype: Object & { prototype: T },
  input: string | JsonValue | Object,
): T {
  return (resolvePolymorphicClass(classPrototype, input)).fromJson(input);
}

/**
 * Calls the polymorphic resolver or polymorphic switch resolver for the provided class prototype
 * and input, and returns the initialized child class. Throws an exception 
 */
function resolvePolymorphicClass<T extends Serializable>(
  classPrototype: Object & { prototype: T },
  input: string | JsonValue | Object,
): T {
  const classResolver = POLYMORPHIC_RESOLVER_MAP.get(classPrototype);
  if (classResolver) {
    return classResolver(input) as T;
  }

  const resolvedClass = resolveSwitchMap(classPrototype, input);

  if (resolvedClass) {
    return resolvedClass as T;
  }

  throw new Error(`Could not resolve class for ${classPrototype.toString()}`);
}

/**
 * Return a resolved class type by checking types on the input. Currently the input is simply `JSON.parse`
 */
function resolveSwitchMap(
  classPrototype: unknown,
  input: string | JsonValue | Object,
): Serializable | null {
  const classMap = POLYMORPHIC_SWITCH_MAP.get(classPrototype);

  if (!classMap) {
    throw new Error(`Could not determine classMap for ${classPrototype}`);
  }

  const inputObject = typeof input === "string" ? JSON.parse(input) : input;

  for (const [propertyKey, valueMap] of classMap.entries()) {
    const value = inputObject[propertyKey];
    const initializer = valueMap.get(value);
    if (initializer) {
      return initializer();
    }
  }

  return null;
}
