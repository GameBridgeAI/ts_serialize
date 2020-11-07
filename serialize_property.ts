// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import {
  FromJsonStrategy,
  SERIALIZABLE_CLASS_MAP,
  SerializePropertyOptions,
  ToJsonStrategy,
} from "./serializable.ts";

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";

export const ERROR_MESSAGE_SYMBOL_PROPERTY_NAME =
  "The key name cannot be inferred from a symbol. A value for serializedName must be provided";

/**
 * Function to transform a property name into a serialized key programmatically
 */
export type ToSerializedKeyStrategy = ((
  propertyName: string | symbol,
) => string);

/** string/symbol property name or options for (de)serializing values */
export type SerializePropertyArgument =
  | string
  | ToSerializedKeyStrategy
  | {
    serializedKey?: string | ToSerializedKeyStrategy;
    fromJsonStrategy?:
      | FromJsonStrategy
      | (FromJsonStrategy | FromJsonStrategy[])[];
    toJsonStrategy?:
      | ToJsonStrategy
      | (ToJsonStrategy | ToJsonStrategy[])[];
  };

interface SerializePropertyArgumentObject {
  serializedKey: string;
  fromJsonStrategy?:
    | FromJsonStrategy
    | (FromJsonStrategy | FromJsonStrategy[])[];
  toJsonStrategy?:
    | ToJsonStrategy
    | (ToJsonStrategy | ToJsonStrategy[])[];
}

/** Property wrapper that adds serializable options to the class map
 * using the original propertyName as the map key
 */
export function SerializeProperty(): PropertyDecorator;

/** Property wrapper that adds serializable options to the class map
 * using the provided string as the map key
 */
export function SerializeProperty(arg: string): PropertyDecorator;

/** Property wrapper that adds serializable options to the class map
 * using options, `serializedName` as the key or `propertyName` if
 * `serializedName` is not set
 */
export function SerializeProperty(
  arg: SerializePropertyArgument,
): PropertyDecorator;

/** Property wrapper that adds serializable options to the class map */
export function SerializeProperty(
  decoratorArguments: SerializePropertyArgument = {},
): PropertyDecorator {
  return (target: unknown, propertyName: string | symbol) => {
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
  if (typeof decoratorArguments === "string") {
    // Direct mapping to string
    return { serializedKey: decoratorArguments };
  } else if (typeof decoratorArguments === "function") {
    // Property key transform function
    return {
      serializedKey: decoratorArguments(propertyName),
    };
  } else {
    // We can't use symbols as keys when serializing
    // a serializedName must be provided if the property isn't a string
    if (
      !decoratorArguments.serializedKey &&
      typeof propertyName === "symbol"
    ) {
      throw new Error(ERROR_MESSAGE_SYMBOL_PROPERTY_NAME);
    }
    if (typeof decoratorArguments.serializedKey === "function") {
      // Property key transform function with additional options
      return {
        serializedKey: decoratorArguments.serializedKey(propertyName),
        fromJsonStrategy: decoratorArguments.fromJsonStrategy,
        toJsonStrategy: decoratorArguments.toJsonStrategy,
      };
    } else {
      // Use inherited tsTransformKey strategy (or default no change transform)
      // to transform property key
      return {
        // we can always define serializedKey as decoratorArguments.serializedKey will override this
        serializedKey: (target as any).tsTransformKey(propertyName),
        ...decoratorArguments,
      };
    }
  }
}
