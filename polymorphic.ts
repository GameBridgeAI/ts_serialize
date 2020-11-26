import { JsonValue, Serializable } from "./serializable.ts";

const POLYMORPHIC_RESOLVER_MAP = new Map<
  unknown,
  (input: string | JsonValue | Object) => Serializable
>();

export function registerPolymorphicResolver(
  classPrototype: unknown,
  resolver: (input: string | JsonValue | Object) => Serializable,
): void {
  POLYMORPHIC_RESOLVER_MAP.set(classPrototype, resolver);
}

// Parent -> key -> value -> initializer
const POLYMORPHIC_SWITCH_MAP = new Map<
  unknown,
  Map<string | symbol, Map<unknown, () => Serializable>>
>();

export function registerPolymorphicSwitch(
  parentPrototype: unknown,
  propertyName: string | symbol,
  propertyValue: unknown,
  initializerFunction: () => Serializable,
): void {
  // Assert parentPrototype != null

  let classMap = POLYMORPHIC_SWITCH_MAP.get(parentPrototype);
  if (!classMap) {
    POLYMORPHIC_SWITCH_MAP.set(parentPrototype, new Map());
    classMap = POLYMORPHIC_SWITCH_MAP.get(parentPrototype);
  }

  let propertyKeyMap = classMap?.get(propertyName);
  if (!propertyKeyMap) {
    classMap?.set(propertyName, new Map());
    propertyKeyMap = classMap?.get(propertyName);
  }

  propertyKeyMap?.set(propertyValue, initializerFunction);
}

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
    const resolver = valueMap.get(value);
    if (resolver) {
      return resolver();
    }
  }

  return null;
}

export function serializePolymorphicClass<T extends Serializable>(
  classPrototype: { prototype: T },
  input: string | JsonValue | Object,
): T {
  return (resolvePolymorphicClass(classPrototype, input) as T).fromJson(input);
}

function resolvePolymorphicClass(
  classPrototype: unknown,
  input: string | JsonValue | Object,
): unknown {
  const classResolver = POLYMORPHIC_RESOLVER_MAP.get(classPrototype);
  if (classResolver) {
    return classResolver(input);
  }

  const resolvedClass = resolveSwitchMap(classPrototype, input);

  if (resolvedClass) {
    return resolvedClass;
  }

  throw new Error(`Could not resolve class for ${classPrototype}`);
}

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

// @PolymorphicSwitch property decorator
export function PolymorphicSwitch(
  initializerFunction: () => Serializable,
  value?: string,
): PropertyDecorator {
  return (
    target: Function | Object, // The constructor of the class for static properties, and the class it's self for instance properties
    propertyKey: string | symbol,
  ) => {
    // Assert property should be static
    if (!Object.prototype.hasOwnProperty.call(target, propertyKey) && !value) {
      throw new Error(
        // TODO: Possible issues with cast here
        `${target} doesn't have own property ${(propertyKey as string)}, or no value provided`,
      );
    }

    let targetConstructor = target;

    if (typeof target !== "function") {
      targetConstructor = target.constructor;
    }

    const parentPrototype = Object.getPrototypeOf(targetConstructor);

    const propertyValue = (target as Record<typeof propertyKey, unknown>)[
      (propertyKey as string)
    ] || value;

    registerPolymorphicSwitch(
      parentPrototype,
      propertyKey,
      // BUG: This can also be symbol, but typescript throws an error due to https://github.com/microsoft/TypeScript/issues/1863
      propertyValue,
      initializerFunction,
    );
  };
}
