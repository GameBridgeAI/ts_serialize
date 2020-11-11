// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  FromJsonStrategy,
  FromJsonStrategyArgument,
  SERIALIZABLE_CLASS_MAP,
  SerializePropertyOptions,
  ToJsonStrategy,
  ToJsonStrategyArgument,
} from "./serializable.ts";

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";

export const ERROR_MESSAGE_SYMBOL_PROPERTY_NAME =
  "The key name cannot be inferred from a symbol. A value for serializedName must be provided";

/**
 * Function to transform a property name into a serialized key programmatically
 */
export type ToSerializedKeyStrategy = (propertyName: string | symbol) => string;

/** string/symbol property name or options for (de)serializing values */
export type SerializePropertyArgument =
  | string
  | ToSerializedKeyStrategy
  | {
    serializedKey?: string | ToSerializedKeyStrategy;
    fromJsonStrategy?:
      | FromJsonStrategy
      | FromJsonStrategyArgument;
    toJsonStrategy?:
      | ToJsonStrategy
      | ToJsonStrategyArgument;
  };

interface SerializePropertyArgumentObject {
  serializedKey: string;
  fromJsonStrategy?:
    | FromJsonStrategy
    | FromJsonStrategyArgument;
  toJsonStrategy?:
    | ToJsonStrategy
    | ToJsonStrategyArgument;
}

/** Property wrapper that adds serializable options to the class map
 * using the original propertyName as the map key
 */
export function SerializeProperty(): PropertyDecorator;

/** Property wrapper that adds serializable options to the class map
 * using the provided string as the map key
 */
export function SerializeProperty(
  decoratorArguments: string,
): PropertyDecorator;

/** Property wrapper that adds serializable options to the class map
 * using options, `serializedName` as the key or `propertyName` if
 * `serializedName` is not set
 */
export function SerializeProperty(
  decoratorArguments: SerializePropertyArgument,
): PropertyDecorator;

/** Property wrapper that adds serializable options to the class map */
export function SerializeProperty(
  decoratorArguments: SerializePropertyArgument = {},
): PropertyDecorator {
  return function _SerializeProperty(
    target: unknown,
    propertyName: string | symbol,
  ) {
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
        decoratorArgumentOptions.fromJsonStrategy,
        decoratorArgumentOptions.toJsonStrategy,
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
      serializedKey: decoratorArguments(propertyName),
    };
  }

  // We can't use symbols as keys when serializing
  // a serializedName must be provided if the property isn't a string
  if (
    !decoratorArguments.serializedKey &&
    typeof propertyName === "symbol"
  ) {
    throw new Error(ERROR_MESSAGE_SYMBOL_PROPERTY_NAME);
  }

  // Property key transform function with additional options
  if (typeof decoratorArguments.serializedKey === "function") {
    return {
      serializedKey: decoratorArguments.serializedKey(propertyName),
      fromJsonStrategy: decoratorArguments.fromJsonStrategy,
      toJsonStrategy: decoratorArguments.toJsonStrategy,
    };
  }

  // Use inherited tsTransformKey strategy or default no change transform
  // to transform property key decoratorArguments.serializedKey will override
  return {
    serializedKey: (target as any).tsTransformKey(propertyName),
    ...decoratorArguments,
  };
}
