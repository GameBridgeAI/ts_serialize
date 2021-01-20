// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import { toJSONDefault } from "./strategy/to_json/default.ts";
import { fromJSONDefault } from "./strategy/from_json/default.ts";
import { toJSONRecursive } from "./strategy/to_json/recursive.ts";
import { ERROR_MISSING_PROPERTIES_MAP } from "./error_messages.ts";

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

export declare interface ToJSON {
  toJson(): string;
}

export declare interface FromJSON {
  fromJSON(json: string | JSONValue | Object): this;
}

export declare interface Serialize {
  tsSerialize(): JSONObject;
}

/** Recursively set default serializer logic for own class definition and parent definitions if none exists */
function getOrInitializeDefaultSerializerLogicForParents(
  targetPrototype: any, // This will the the class instance, regardless of how low level it is
): SerializePropertyOptionsMap | undefined {
  // Don't create serialization logic for Serializable
  if (targetPrototype === Serializable.prototype) {
    return undefined;
  }

  if (!SERIALIZABLE_CLASS_MAP.has(targetPrototype)) {
    // If the parent has a serialization map then inherit it
    let parentMap = SERIALIZABLE_CLASS_MAP.get(
      Object.getPrototypeOf(targetPrototype),
    );

    // If the parent is also missing it's map then generate it if necessary
    if (!parentMap) {
      parentMap = getOrInitializeDefaultSerializerLogicForParents(
        Object.getPrototypeOf(targetPrototype),
      );
    }

    return SERIALIZABLE_CLASS_MAP.set(
      targetPrototype,
      new SerializePropertyOptionsMap(parentMap),
    ).get(
      targetPrototype,
    );
  }

  return SERIALIZABLE_CLASS_MAP.get(targetPrototype);
}

/** Adds methods for serialization */
export abstract class Serializable {
  /** allow empty class serialization */
  constructor() {
    getOrInitializeDefaultSerializerLogicForParents(this.constructor.prototype);
  }
  /** key transform functionality */
  public tsTransformKey?(key: string): string {
    return key;
  }
  /** to JSON String */
  public toJSON?(): string {
    return toJSON(this);
  }
  /** Deserialize to Serializable */
  public fromJSON?(json: string | JSONValue | Object): this {
    return fromJSON(this, json);
  }
  /** to JSONObject */
  public tsSerialize?(): JSONObject {
    return toPojo(this);
  }
}

/** Options for each class */
export type SerializableMap = Map<unknown, SerializePropertyOptionsMap>;

/** Class options map */
export const SERIALIZABLE_CLASS_MAP: SerializableMap = new Map<
  unknown,
  SerializePropertyOptionsMap
>();

/** Converts to object using mapped keys */
export function toPojo(
  context: any,
): JSONObject {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );

  if (!serializablePropertyMap) {
    throw new Error(
      `${ERROR_MISSING_PROPERTIES_MAP}: ${context?.constructor
        ?.prototype}`,
    );
  }
  const record: JSONObject = {};
  for (
    let {
      propertyKey,
      serializedKey,
      toJSONStrategy = toJSONDefault,
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
      toJSONStrategy = toJSONRecursive;
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
  json: string | JSONValue | Object,
): T {
  const _json = typeof json === "string" ? JSON.parse(json) : json;
  const accumulator: Partial<T> = {};

  for (const [key, value] of Object.entries(_json)) {
    const {
      propertyKey,
      fromJSONStrategy = fromJSONDefault,
    } = (SERIALIZABLE_CLASS_MAP.get(
      context?.constructor?.prototype,
    ) as SerializePropertyOptionsMap).getBySerializedKey(key) || {};

    if (!propertyKey) {
      continue;
    }

    accumulator[propertyKey as keyof T] = Array.isArray(value)
      ? value.map((v) => fromJSONStrategy(v))
      : fromJSONStrategy(value as JSONValue);
  }

  return Object.assign(
    context,
    accumulator as T,
  );
}
