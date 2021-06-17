// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  JSONValue,
  Serializable,
  SERIALIZABLE_CLASS_MAP,
} from "./serializable.ts";
import { ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS } from "./error_messages.ts";
import { fromJSONDefault } from "./strategy/from_json/default.ts";

/**
 * Function type to ensure that initializers take no arguments and return a valid serializable
 */
export type InitializerFunction = () => Serializable;

/** Polymorphic class deserializer
 *
 * There are currently 2 ways of doing polymorphic deserialization:
 * 1. Manually using \@PolymorphicResolver on a static method on the parent class
 *
 * This works by keeping a map of target 'parent' classes to resolver functions.
 * These are set when a static method is annotated with @PolymorphicResolver.
 * You can then call `serializePolymorphicClass` with the parent class and an
 * input the input is passed to whatever the corresponding resolver function,
 * which will make a determination and returns an instance of a 'child' class
 *
 * 2. Implicitly using \@PolymorphicSwitch instance property on a child class.
 *
 * This works by mapping the decorated class' parent prototype to the child
 * class, property key, property value (or property value test), and initializer
 * function
 */

/** \@PolymorphicResolver method decorator */
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
  /** `Object` is used with Angular's HttpClient */
  // deno-lint-ignore ban-types
  json: string | JSONValue | Object,
) => Serializable | null;

/** Map of parent class constructors to functions that take in a JSON input and output a class instance that inherits Serializable */
const POLYMORPHIC_RESOLVER_MAP = new Map<unknown, ResolverFunction>();

/** Adds a class and a resolver function to the resolver map */
function registerPolymorphicResolver(
  classPrototype: unknown,
  resolver: ResolverFunction,
): void {
  POLYMORPHIC_RESOLVER_MAP.set(classPrototype, resolver);
}

/**
 * \@PolymorphicSwitch property decorator.
 *
 * Maps the provided initializer function and value or propertyValueTest to the parent class
 */
export function PolymorphicSwitch(
  initializerFunction: InitializerFunction,
  propertyValueTest: PropertyValueTest,
): PropertyDecorator;

export function PolymorphicSwitch<T>(
  initializerFunction: InitializerFunction,
  value: Exclude<T, PropertyValueTest>,
): PropertyDecorator;

export function PolymorphicSwitch(
  initializerFunction: InitializerFunction,
  valueOrTest: PropertyValueTest | unknown,
): PropertyDecorator {
  return function _PolymorphicSwitch(
    target: unknown, // The class it's self
    propertyKey: string | symbol,
  ) {
    registerPolymorphicSwitch(
      Object.getPrototypeOf(target).constructor, // Parent's prototype
      target,
      propertyKey,
      valueOrTest,
      initializerFunction,
    );
  };
}

const POLYMORPHIC_SWITCH_MAP = new Map<unknown, Set<PolymorphicClassOptions>>();

type PolymorphicClassOptions = {
  classDefinition: unknown;
  propertyKey: string | symbol;
  propertyValueTest: PropertyValueTest;
  initializer: InitializerFunction;
};

export type PropertyValueTest = (propertyValue: unknown) => boolean;

/**
 * Registers a set of polymorphic class options with a parent class
 */
function registerPolymorphicSwitch<T>(
  parentClassConstructor: unknown,
  classDefinition: unknown,
  propertyKey: string | symbol,
  propertyValueTest: PropertyValueTest,
  initializer: InitializerFunction,
): void;

function registerPolymorphicSwitch<T>(
  parentClassConstructor: unknown,
  classDefinition: unknown,
  propertyKey: string | symbol,
  propertyValue: Exclude<T, PropertyValueTest>,
  initializer: InitializerFunction,
): void;

function registerPolymorphicSwitch<T>(
  parentClassConstructor: unknown,
  classDefinition: unknown,
  propertyKey: string | symbol,
  valueOrTest: PropertyValueTest | unknown,
  initializer: InitializerFunction,
): void {
  let classPropertiesSet = POLYMORPHIC_SWITCH_MAP.get(parentClassConstructor);

  if (!classPropertiesSet) {
    classPropertiesSet = new Set<PolymorphicClassOptions>();
    POLYMORPHIC_SWITCH_MAP.set(parentClassConstructor, classPropertiesSet);
  }

  if (valueOrTest instanceof Function) {
    classPropertiesSet.add({
      classDefinition,
      propertyKey,
      propertyValueTest: valueOrTest as PropertyValueTest,
      initializer,
    });
  } else {
    // If a value was provided set the property value test to be a simple equality check
    classPropertiesSet.add({
      classDefinition,
      propertyKey,
      propertyValueTest: (propertyValue) => propertyValue === valueOrTest,
      initializer,
    });
  }
}

/** Return a resolved class type by testing the value of a property key */
function resolvePolymorphicSwitch(
  parentClassConstructor: unknown,
  /** `Object` is used with Angular's HttpClient */
  // deno-lint-ignore ban-types
  json: string | JSONValue | Object,
): Serializable | null {
  const classOptionsSet = POLYMORPHIC_SWITCH_MAP.get(
    parentClassConstructor,
  );

  if (!classOptionsSet) {
    return null;
  }

  const _json = typeof json === "string" ? JSON.parse(json) : json;

  for (
    const {
      classDefinition,
      propertyKey,
      propertyValueTest,
      initializer,
    } of classOptionsSet.values()
  ) {
    const classMap = SERIALIZABLE_CLASS_MAP.get(
      classDefinition,
    );

    if (!classMap) {
      continue;
    }

    const serializePropertyOptions = classMap.getByPropertyKey(propertyKey);

    if (!serializePropertyOptions) {
      continue;
    }

    const fromJSONStrategy = serializePropertyOptions.fromJSONStrategy ||
      fromJSONDefault;
    const deserializedValue = fromJSONStrategy(
      _json[serializePropertyOptions.serializedKey],
    );

    if (propertyValueTest(deserializedValue)) {
      return initializer();
    }
  }

  // Return null if no child could be matched to this value
  return null;
}

/** Uses either the polymorphic resolver or the polymorphic switch resolver to determine the
 * appropriate class, then deserialize the input using Serializable#fromJSON, returning the result
 */
export function polymorphicClassFromJSON<T extends Serializable>(
  classPrototype: unknown & { prototype: T },
  /** `Object` is used with Angular's HttpClient */
  // deno-lint-ignore ban-types
  json: string | JSONValue | Object,
): T {
  return resolvePolymorphicClass(classPrototype, json).fromJSON(json);
}

/** Calls the polymorphic resolver or polymorphic switch resolver for the provided class prototype
 * and input, and returns the initialized child class. Throws an exception if no class can be resolved
 */
function resolvePolymorphicClass<T extends Serializable>(
  classPrototype: unknown & { prototype: T },
  /** `Object` is used with Angular's HttpClient */
  // deno-lint-ignore ban-types
  json: string | JSONValue | Object,
): T {
  const classResolver = POLYMORPHIC_RESOLVER_MAP.get(classPrototype);
  if (classResolver) {
    return classResolver(json) as T;
  }

  const resolvedClass = resolvePolymorphicSwitch(classPrototype, json);

  if (resolvedClass) {
    return resolvedClass as T;
  }

  throw new Error(ERROR_FAILED_TO_RESOLVE_POLYMORPHIC_CLASS);
}
