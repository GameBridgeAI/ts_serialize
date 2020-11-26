// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import { defaultToJson } from "./to_json/default.ts";
import { defaultFromJson } from "./from_json/default.ts";
import { recursiveToJson } from "./to_json/recursive.ts";

/** A JSON object where each property value is a simple JSON value. */
export type JsonObject = {
  [key: string]: JsonValue;
};

/** A JSON array where each value is a simple JSON value. */
export interface JsonArray extends Array<JsonValue> {}

/** A property value in a JSON object. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

/** to be implemented by external authors on their models  */
export declare interface TransformKey {
  /** a function that will be called against
   * every property key transforming the key
   * with the provided function
   */
  tsTransformKey(key: string): string;
}

/** Adds methods for serialization */
export abstract class Serializable {
  /** Default transform functionality */
  public tsTransformKey?(key: string): string {
    return key;
  }
  /** Serializable to Json String */
  public toJson(): string {
    return toJson(this);
  }
  /** Deserialize to Serializable */
  public fromJson(json: JsonValue | Object): this {
    return fromJson(this, json);
  }

  constructor() {
    this.getOrInitializeDefaultSerializerLogicForParents();
  }

  // Recursively set default serializer logic for own class definition and parent definitions if none exists
  private getOrInitializeDefaultSerializerLogicForParents(
    targetPrototype = this.constructor.prototype, // This will the the class instance, regardless of how low level it is
  ): SerializePropertyOptionsMap | undefined {
    // Don't create serialization logic for Serializable
    if (targetPrototype === Serializable.prototype) {
      return undefined;
    }

    const serializableOptions = SERIALIZABLE_CLASS_MAP.get(targetPrototype);
    if (!serializableOptions) {
      // If the parent has a serialization map then inherit it
      let parentMap = SERIALIZABLE_CLASS_MAP.get(
        Object.getPrototypeOf(targetPrototype),
      );

      // If the parent is also missing it's map then generate it if necessary
      if (!parentMap) {
        parentMap = this.getOrInitializeDefaultSerializerLogicForParents(
          Object.getPrototypeOf(targetPrototype),
        );
      }

      SERIALIZABLE_CLASS_MAP.set(
        targetPrototype,
        new SerializePropertyOptionsMap(parentMap),
      );
      const newSerializableOptions = SERIALIZABLE_CLASS_MAP.get(
        targetPrototype,
      );

      if (!newSerializableOptions) {
        // This shouldn't happen considering we just added that value
        throw new Error(ERROR_MESSAGE_MISSING_PROPERTIES_MAP);
      }

      return newSerializableOptions;
    }

    return serializableOptions;
  }
}

/** Functions used when hydrating data */
export type FromJsonStrategy = (value: JsonValue) => any;
export type FromJsonStrategyArgument =
  (FromJsonStrategy | FromJsonStrategy[])[];

/** Functions used when dehydrating data */
export type ToJsonStrategy = (value: any) => JsonValue;
export type ToJsonStrategyArgument = (ToJsonStrategy | ToJsonStrategy[])[];

/** options to use when (de)serializing values */
export class SerializePropertyOptions {
  public fromJsonStrategy?: FromJsonStrategy;
  public toJsonStrategy?: ToJsonStrategy;

  constructor(
    public propertyKey: string | symbol,
    public serializedKey: string,
    fromJsonStrategy?: FromJsonStrategy | FromJsonStrategyArgument,
    toJsonStrategy?: ToJsonStrategy | ToJsonStrategyArgument,
  ) {
    if (Array.isArray(fromJsonStrategy)) {
      this.fromJsonStrategy = composeStrategy(...fromJsonStrategy);
    } else if (fromJsonStrategy) {
      this.fromJsonStrategy = fromJsonStrategy;
    }

    if (Array.isArray(toJsonStrategy)) {
      this.toJsonStrategy = composeStrategy(...toJsonStrategy);
    } else if (toJsonStrategy) {
      this.toJsonStrategy = toJsonStrategy;
    }
  }
}

/** list of FromJsonStrategy to one FromJsonStrategy composition */
export function composeStrategy(
  ...fns: FromJsonStrategyArgument
): FromJsonStrategy;

/** list of ToJsonStrategy to one ToJsonStrategy composition */
export function composeStrategy(
  ...fns: ToJsonStrategyArgument
): ToJsonStrategy;

/** Function to build a `fromJsonStrategy` or `toJsonStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns:
    | FromJsonStrategyArgument
    | ToJsonStrategyArgument
): FromJsonStrategy | ToJsonStrategy {
  return function _composeStrategy(val: any): any {
    return fns.flat().reduce(
      (acc: any, fn: FromJsonStrategy | ToJsonStrategy) => fn(acc),
      val,
    );
  };
}

/** Options for each class */
export type SerializableMap = Map<unknown, SerializePropertyOptionsMap>;

/** Class options map */
export const SERIALIZABLE_CLASS_MAP: SerializableMap = new Map<
  unknown,
  SerializePropertyOptionsMap
>();

const ERROR_MESSAGE_MISSING_PROPERTIES_MAP =
  "Unable to load serializer properties for the given context";

/** Converts to object using mapped keys */
export function toPojo(
  context: any,
): JsonObject {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );

  if (!serializablePropertyMap) {
    throw new Error(
      `${ERROR_MESSAGE_MISSING_PROPERTIES_MAP}: ${context?.constructor
        ?.prototype}`,
    );
  }
  const record: JsonObject = {};
  for (
    let {
      propertyKey,
      serializedKey,
      toJsonStrategy = defaultToJson,
    } of serializablePropertyMap.propertyOptions()
  ) {
    // Assume that key is always a string, a check is done earlier in SerializeProperty
    const value = context[propertyKey as string];

    // If the value is serializable then use the recursive replacer
    if (
      SERIALIZABLE_CLASS_MAP.get(
        (value as Serializable)?.constructor?.prototype,
      )
    ) {
      toJsonStrategy = recursiveToJson;
    }

    if (Array.isArray(value)) {
      record[serializedKey] = value.map((item: any) => {
        if (item instanceof Serializable) {
          return toPojo(item);
        }
        return toJsonStrategy(item);
      });
    } else if (value !== undefined) {
      record[serializedKey] = toJsonStrategy(value);
    }
  }
  return record;
}

/** Convert to `pojo` with our mapping logic then to string */
function toJson<T>(context: T): string {
  return JSON.stringify(toPojo(context));
}

/** Convert from object/string to mapped object on the context */
function fromJson<T>(
  context: Serializable,
  json: JsonValue | Object,
): T {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );
  if (!serializablePropertyMap) {
    throw new Error(
      `${ERROR_MESSAGE_MISSING_PROPERTIES_MAP}: ${context?.constructor
        ?.prototype}`,
    );
  }

  const _json = typeof json === "string" ? json : JSON.stringify(json);

  return Object.assign(
    context,
    JSON.parse(
      _json,
      /** Processes the value through the provided or default `fromJsonStrategy` */
      function revive(key: string, value: JsonValue): unknown {
        // After the last iteration of the fromJsonStrategy a function
        // will be called one more time with a empty string key
        if (key === "") {
          return value;
        }

        const {
          propertyKey,
          fromJsonStrategy = defaultFromJson,
        } = serializablePropertyMap.getBySerializedKey(key) || {};

        const processedValue: unknown = Array.isArray(value)
          ? value.map((v) => fromJsonStrategy(v))
          : fromJsonStrategy(value);

        if (propertyKey) {
          context[propertyKey as keyof Serializable] = processedValue as any;
          return;
        }
        return processedValue;
      },
    ),
  );
}
