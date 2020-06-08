// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import { defaultToJson } from "./to_json/default_to_json.ts";
import { recursiveToJson } from "./to_json/recursive_to_json.ts";

/** Functions used when hydrating data */
export declare type FromJsonStrategy = (value: any) => any;

/** Functions used when dehydrating data */
export declare type ToJsonStrategy = (value: any) => any;

/** options to use when (de)serializing values */
export class SerializePropertyOptions {
  public fromJsonStrategy?: FromJsonStrategy;
  public toJsonStrategy?: ToJsonStrategy;

  constructor(
    public propertyKey: string | symbol,
    public serializedKey: string,
    fromJsonStrategy?:
      | FromJsonStrategy
      | (FromJsonStrategy | FromJsonStrategy[])[],
    toJsonStrategy?:
      | ToJsonStrategy
      | (ToJsonStrategy | ToJsonStrategy[])[],
  ) {
    if (Array.isArray(fromJsonStrategy)) {
      this.fromJsonStrategy = composeFromJsonStrategy(...fromJsonStrategy);
    } else if (fromJsonStrategy) {
      this.fromJsonStrategy = fromJsonStrategy;
    }

    if (Array.isArray(toJsonStrategy)) {
      this.toJsonStrategy = composeToJsonStrategy(...toJsonStrategy);
    } else if (toJsonStrategy) {
      this.toJsonStrategy = toJsonStrategy;
    }
  }
}

/** Function to build a `fromJsonStrategy`
 * Converts value from functions provided as parameters
 */
export function composeFromJsonStrategy(
  ...fns: (FromJsonStrategy | FromJsonStrategy[])[]
): FromJsonStrategy {
  return (val: unknown): unknown =>
    fns.flat().reduce((acc: unknown, f: FromJsonStrategy) => f(acc), val);
}

/** Function to build a `toJsonStrategy`
 * Converts value from functions provided as parameters
 */
export function composeToJsonStrategy(
  ...fns: (ToJsonStrategy | ToJsonStrategy[])[]
): ToJsonStrategy {
  return (val: unknown): unknown =>
    fns.flat().reduce((acc: unknown, f: ToJsonStrategy) => f(acc), val);
}
/** Options for each class */
export declare type SerializableMap = Map<unknown, SerializePropertyOptionsMap>;

/** Class options map */
export const SERIALIZABLE_CLASS_MAP: SerializableMap = new Map<
  unknown,
  SerializePropertyOptionsMap
>();

const MISSING_PROPERTIES_MAP_ERROR_MESSAGE =
  "Unable to load serializer properties for the given context";

/** Converts to object using mapped keys */
export function toPojo<T>(
  context: Record<keyof T, unknown>,
): Record<string, unknown> {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );

  if (!serializablePropertyMap) {
    throw new Error(
      `${MISSING_PROPERTIES_MAP_ERROR_MESSAGE}: ${context?.constructor
        ?.prototype}`,
    );
  }
  const record: Record<string, unknown> = {};
  for (
    let {
      propertyKey,
      serializedKey,
      toJsonStrategy,
    } of serializablePropertyMap.propertyOptions()
  ) {
    // Assume that key is always a string, a check is done earlier in SerializeProperty
    const value = context[propertyKey as keyof T];

    // If no replacer strategy was provided then default
    if (!toJsonStrategy) {
      if (
        SERIALIZABLE_CLASS_MAP.get(
          (value as Serializable<typeof value>)?.constructor?.prototype,
        )
      ) {
        // If the value is serializable then use the recursive replacer
        toJsonStrategy = recursiveToJson;
      } else {
        toJsonStrategy = defaultToJson;
      }
    }

    // Array handling
    if (Array.isArray(value)) {
      const arrayToJsonStrategy = toJsonStrategy;
      record[serializedKey] = value.map((v: any) => arrayToJsonStrategy(v));
    } // Object and value handling
    else if (value !== undefined) {
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
function fromJson<T>(context: Serializable<T>, json: string): T;

function fromJson<T>(context: Serializable<T>, json: Partial<T>): T;

function fromJson<T>(context: Serializable<T>, json: string | Partial<T>): T;

function fromJson<T>(context: Serializable<T>, json: string | Partial<T>): T {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );
  if (!serializablePropertyMap) {
    throw new Error(
      `${MISSING_PROPERTIES_MAP_ERROR_MESSAGE}: ${context?.constructor
        ?.prototype}`,
    );
  }

  const _json = typeof json === "string" ? json : JSON.stringify(json);

  return Object.assign(
    context,
    JSON.parse(
      _json,
      /** Processes the value through the provided or default `reviveStrategy`
       * @default reviveStrategy - no-op reviver strategy
       */
      function revive<T>(this: unknown, key: string, value: unknown): unknown {
        // After last iteration the reviver function will be called one more time with a empty string key
        if (key === "") {
          return value;
        }

        const {
          propertyKey,
          fromJsonStrategy = (v: unknown) => v, // Default to no-op reviver strategy
        } = serializablePropertyMap.getBySerializedKey(key) || {};

        const processedValue: unknown = Array.isArray(value)
          ? value.map((v) => fromJsonStrategy(v))
          : fromJsonStrategy(value);

        if (propertyKey) {
          context[propertyKey as keyof Serializable<T>] = processedValue as any;
          return;
        }
        return processedValue;
      },
    ),
  );
}

/** Adds methods for serialization */
export abstract class Serializable<T> {
  public toJson(): string {
    return toJson(this);
  }
  public fromJson(): T;
  public fromJson(json: string): T;
  public fromJson(json: Partial<T>): T;
  public fromJson(json: string | Partial<T> = {}): T {
    return fromJson(this, json);
  }
}
