// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import { defaultToJSON } from "./to_json/default.ts";
import { defaultFromJSON } from "./from_json/default.ts";
import { recursiveToJSON } from "./to_json/recursive.ts";

/** A JSON object where each property value is a simple JSON value. */
export type JSONObject = {
  [key: string]: JSONValue;
};

/** A JSON array where each value is a simple JSON value. */
export interface JSONArray extends Array<JSONValue> {}

/** A property value in a JSON object. */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

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
  /** key transform functionality */
  public tsTransformKey?(key: string): string {
    return key;
  }
  /** to JSON String */
  public toJSON(): string {
    return toJSON(this);
  }
  /** to instanceof */
  public fromJSON(json: JSONValue | Object): this {
    return fromJSON(this, json);
  }
  /** to JSONObject */
  public tsSerialize(): JSONObject {
    return toPojo(this);
  }
}

/** Functions used when hydrating data */
export type FromJSONStrategy = (value: JSONValue) => any;
export type FromJSONStrategyArgument =
  (FromJSONStrategy | FromJSONStrategy[])[];

/** Functions used when dehydrating data */
export type ToJSONStrategy = (value: any) => JSONValue;
export type ToJSONStrategyArgument = (ToJSONStrategy | ToJSONStrategy[])[];

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

/** Function to build a `fromJSONStrategy` or `toJSONStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns:
    | FromJSONStrategyArgument
    | ToJSONStrategyArgument
): FromJSONStrategy | ToJSONStrategy {
  return function _composeStrategy(val: any): any {
    return fns.flat().reduce(
      (acc: any, fn: FromJSONStrategy | ToJSONStrategy) => fn(acc),
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
): JSONObject {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );

  if (!serializablePropertyMap) {
    throw new Error(
      `${ERROR_MESSAGE_MISSING_PROPERTIES_MAP}: ${context?.constructor
        ?.prototype}`,
    );
  }
  const record: JSONObject = {};
  for (
    let {
      propertyKey,
      serializedKey,
      toJSONStrategy = defaultToJSON,
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
      toJSONStrategy = recursiveToJSON;
    }

    if (Array.isArray(value)) {
      record[serializedKey] = value.map((item: any) => {
        if (item instanceof Serializable) {
          return toPojo(item);
        }
        return toJSONStrategy(item);
      });
    } else if (value !== undefined) {
      record[serializedKey] = toJSONStrategy(value);
    }
  }
  return record;
}

/** Convert to `pojo` with our mapping logic then to string */
function toJSON<T>(context: T): string {
  return JSON.stringify(toPojo(context));
}

/** Convert from object/string to mapped object on the context */
function fromJSON<T>(
  context: Serializable,
  json: JSONValue | Object,
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
      /** Processes the value through the provided or default `fromJSONStrategy` */
      function revive(key: string, value: JSONValue): unknown {
        // After the last iteration of the fromJSONStrategy a function
        // will be called one more time with a empty string key
        if (key === "") {
          return value;
        }

        const {
          propertyKey,
          fromJSONStrategy = defaultFromJSON,
        } = serializablePropertyMap.getBySerializedKey(key) || {};

        const processedValue: unknown = Array.isArray(value)
          ? value.map((v) => fromJSONStrategy(v))
          : fromJSONStrategy(value);

        if (propertyKey) {
          context[propertyKey as keyof Serializable] = processedValue as any;
          return;
        }
        return processedValue;
      },
    ),
  );
}
