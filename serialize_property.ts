// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { SERIALIZABLE_CLASS_MAP } from "./serializable.ts";

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import {
  composeStrategy,
  FromJSONStrategy,
  FromJSONStrategyArgument,
  ToJSONStrategy,
  ToJSONStrategyArgument,
} from "./strategy/compose_strategy.ts";
import { ERROR_SYMBOL_PROPERTY_NAME } from "./error_messages.ts";

/** options to use when (de)serializing values */
export class SerializePropertyOptions {
  public fromJSONStrategy?: FromJSONStrategy;
  public toJSONStrategy?: ToJSONStrategy;

  constructor(
    public propertyKey: string | symbol,
    public serializedKey: string,
    fromJSONStrategy?: FromJSONStrategy | FromJSONStrategyArgument,
    toJSONStrategy?: ToJSONStrategy | ToJSONStrategyArgument,
  ) {
    if (Array.isArray(fromJSONStrategy)) {
      this.fromJSONStrategy = composeStrategy(...fromJSONStrategy);
    } else if (fromJSONStrategy) {
      this.fromJSONStrategy = fromJSONStrategy;
    }

    if (Array.isArray(toJSONStrategy)) {
      this.toJSONStrategy = composeStrategy(...toJSONStrategy);
    } else if (toJSONStrategy) {
      this.toJSONStrategy = toJSONStrategy;
    }
  }
}

/**
 * Function to transform a property name into a serialized key programmatically
 */
export type ToSerializedKeyStrategy = (propertyName: string) => string;

/** string/symbol property name or options for (de)serializing values */
export type SerializePropertyArgument =
  | string
  | ToSerializedKeyStrategy
  | {
    serializedKey?: string | ToSerializedKeyStrategy;
    fromJSONStrategy?:
      | FromJSONStrategy
      | FromJSONStrategyArgument;
    toJSONStrategy?:
      | ToJSONStrategy
      | ToJSONStrategyArgument;
  };

interface SerializePropertyArgumentObject {
  serializedKey: string;
  fromJSONStrategy?:
    | FromJSONStrategy
    | FromJSONStrategyArgument;
  toJSONStrategy?:
    | ToJSONStrategy
    | ToJSONStrategyArgument;
}

/** Property wrapper that adds serializable options to the class map */
export function SerializeProperty(
  args?: string | SerializePropertyArgument,
): PropertyDecorator {
  return function _SerializeProperty(
    target: unknown,
    propertyName: string | symbol,
  ) {
    const decoratorArguments = args ?? {};
    const decoratorArgumentOptions = getDecoratorArgumentOptions(
      decoratorArguments,
      target,
      propertyName,
    );

    let serializablePropertiesMap = SERIALIZABLE_CLASS_MAP.get(target);

    // Initialize the map for this class
    if (!serializablePropertiesMap) {
      // If the parent has a serialization map then inherit it
      const parentMap = SERIALIZABLE_CLASS_MAP.get(
        Object.getPrototypeOf(target),
      );

      SERIALIZABLE_CLASS_MAP.set(
        target,
        new SerializePropertyOptionsMap(parentMap),
      );

      serializablePropertiesMap = SERIALIZABLE_CLASS_MAP.get(
        target,
      );
    }

    serializablePropertiesMap?.set(
      new SerializePropertyOptions(
        propertyName,
        decoratorArgumentOptions.serializedKey,
        decoratorArgumentOptions.fromJSONStrategy,
        decoratorArgumentOptions.toJSONStrategy,
      ),
    );
  };
}

/** Parses the arguments provided to SerializeProperty and 
 * returns an object used to create a key mapping
 */
function getDecoratorArgumentOptions(
  decoratorArguments: SerializePropertyArgument,
  target: unknown,
  propertyName: string | symbol,
): SerializePropertyArgumentObject {
  // Direct mapping to string
  if (typeof decoratorArguments === "string") {
    return { serializedKey: decoratorArguments };
  }

  // Property key transform function
  if (typeof decoratorArguments === "function") {
    return {
      serializedKey: decoratorArguments(String(propertyName)),
    };
  }

  // We can't use symbols as keys when serializing
  // a serializedName must be provided if the property isn't a string
  if (
    !decoratorArguments.serializedKey &&
    typeof propertyName === "symbol"
  ) {
    throw new Error(ERROR_SYMBOL_PROPERTY_NAME);
  }

  // Property key transform function with additional options
  if (typeof decoratorArguments.serializedKey === "function") {
    return {
      serializedKey: decoratorArguments.serializedKey(String(propertyName)),
      fromJSONStrategy: decoratorArguments.fromJSONStrategy,
      toJSONStrategy: decoratorArguments.toJSONStrategy,
    };
  }

  // Use inherited tsTransformKey strategy or default no change transform
  // to transform property key decoratorArguments.serializedKey will override
  return {
    serializedKey: (target as any).tsTransformKey(String(propertyName)),
    ...decoratorArguments,
  };
}
