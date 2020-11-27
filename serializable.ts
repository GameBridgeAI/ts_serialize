// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import { toJSONDefault } from "./strategy/to_json/default.ts";
import { fromJSONDefault } from "./strategy/from_json/default.ts";
import { toJSONRecursive } from "./strategy/to_json/recursive.ts";
import { ERROR_MISSING_PROPERTIES_MAP } from "./error_messages.ts";
import { JsonValue } from "https://deno.land/x/ts_serialize@v0.3.6/serializable.ts";

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
  /** allow empty class serialization */
  constructor() {
    this.getOrInitializeDefaultSerializerLogicForParents();
  }
  /** key transform functionality */
  public tsTransformKey?(key: string): string {
    return key;
  }
  /** to JSON String */
  public toJSON(): string {
    return toJSON(this);
  }
  /** Deserialize to Serializable */
  public fromJSON(json: string | JsonValue | Object): this {
    return fromJSON(this, json);
  }
  /** to JSONObject */
  public tsSerialize(): JSONObject {
    return toPojo(this);
  }
  /** Recursively set default serializer logic for own class definition and parent definitions if none exists */
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
        throw new Error(ERROR_MISSING_PROPERTIES_MAP);
      }

      return newSerializableOptions;
    }

    return serializableOptions;
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
  json: string | JsonValue | Object,
): T {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );
  if (!serializablePropertyMap) {
    throw new Error(
      `${ERROR_MISSING_PROPERTIES_MAP}: ${context?.constructor
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
          fromJSONStrategy = fromJSONDefault,
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
