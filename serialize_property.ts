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

/** string/symbol property name or options for (de)serializing values */
export type SerializePropertyArgument =
  | string
  | {
    serializedKey?: string;
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
    let decoratorArgumentOptions: SerializePropertyArgumentObject;

    if (typeof decoratorArguments === "string") {
      decoratorArgumentOptions = { serializedKey: decoratorArguments };
    } else {
      // We can't use symbols as keys when serializing
      // a serializedName must be provided if the property isn't a string
      if (
        !decoratorArguments.serializedKey &&
        typeof propertyName === "symbol"
      ) {
        throw new Error(ERROR_MESSAGE_SYMBOL_PROPERTY_NAME);
      }

      decoratorArgumentOptions = {
        serializedKey: propertyName as string,
        ...decoratorArguments,
      };
    }

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
      ) as SerializePropertyOptionsMap;
    }

    serializablePropertiesMap.set(
      new SerializePropertyOptions(
        propertyName,
        decoratorArgumentOptions.serializedKey,
        decoratorArgumentOptions.fromJsonStrategy,
        decoratorArgumentOptions.toJsonStrategy,
      ),
    );
  };
}
