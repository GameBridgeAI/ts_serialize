// Copyright 2018-2020 ts_serialize authors. All rights reserved. MIT license.

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import { defaultReplacer } from "./replacers/default_replacer.ts";

/** Functions used when hydrating data */
export declare type ReviverStrategy = (value: any) => any;

/** Functions used when dehydrating data */
export declare type ReplacerStrategy = (value: any) => any;

/** options to use when (de)serializing values */
export class SerializePropertyOptions {
  public reviverStrategy?: ReviverStrategy;
  public replacerStrategy?: ReplacerStrategy;

  constructor(
    public propertyKey: string | symbol,
    public serializedKey: string,
    reviverStrategy?: ReviverStrategy | (ReviverStrategy | ReviverStrategy[])[],
    replacerStrategy?: ReplacerStrategy | (ReplacerStrategy | ReplacerStrategy[])[]
  ) {
    if (Array.isArray(reviverStrategy)) {
      this.reviverStrategy = composeReviveStrategy(...reviverStrategy);
    } else if (reviverStrategy) {
      this.reviverStrategy = reviverStrategy;
    }

    if (Array.isArray(replacerStrategy)) {
      this.replacerStrategy = composeReplaceStrategy(...replacerStrategy);
    } else if (replacerStrategy) {
      this.replacerStrategy = replacerStrategy;
    }
  }
}

/** Function to build a `reviveStrategy`
 * Converts value from functions provided as parameters
 */
export function composeReviveStrategy(
  ...fns: (ReviverStrategy | ReviverStrategy[])[]
): ReviverStrategy {
  return (val: unknown): unknown =>
    fns.flat().reduce((acc: unknown, f: ReviverStrategy) => f(acc), val);
}

/** Function to build a `replaceStrategy`
 * Converts value from functions provided as parameters
 */
export function composeReplaceStrategy(
  ...fns: (ReplacerStrategy | ReplacerStrategy[])[]
): ReplacerStrategy {
  return (val: unknown): unknown =>
    fns.flat().reduce((acc: unknown, f: ReplacerStrategy) => f(acc), val);
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
export function toPojo<T>(context: Record<keyof T, unknown>): Record<string, unknown> {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype
  );

  if (!serializablePropertyMap) {
    throw new Error(
      `${MISSING_PROPERTIES_MAP_ERROR_MESSAGE}: ${context?.constructor?.prototype}`
    );
  }
  const record: Record<string, unknown> = {};
  for (const {
    propertyKey,
    serializedKey,
    replacerStrategy = defaultReplacer,
  } of serializablePropertyMap.propertyOptions()) {
    // Assume that key is always a string, a check is done earlier in SerializeProperty
    const value = context[propertyKey as keyof T];

    // Array handling
    if (Array.isArray(value)) {
      record[serializedKey] = value
        .map((v: unknown) =>
          replacerStrategy(v)
        );
    } // Object and value handling
    else if (value !== undefined) {
      record[serializedKey] = replacerStrategy(value);
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
    context?.constructor?.prototype
  );
  if (!serializablePropertyMap) {
    throw new Error(
      `${MISSING_PROPERTIES_MAP_ERROR_MESSAGE}: ${context?.constructor?.prototype}`
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
          reviverStrategy = (v: unknown) => v, // Default to no-op reviver strategy
        } = serializablePropertyMap.getBySerializedKey(key) || {};

        const processedValue: unknown = Array.isArray(value)
          ? value.map((v) => reviverStrategy(v))
          : reviverStrategy(value);

        if (propertyKey) {
          context[propertyKey as keyof Serializable<T>] = processedValue as any;
          return;
        }
        return processedValue;
      }
    )
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
