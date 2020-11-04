// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

import { SerializePropertyOptionsMap } from "./serialize_property_options_map.ts";
import { defaultToJson } from "./to_json/default.ts";
import { recursiveToJson } from "./to_json/recursive.ts";

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
  /** the default transform functionality */
  public tsTransformKey?(key: string): string {
    return key;
  }
  public toJson(): string {
    return toJson(this);
  }
  public fromJson(): this;
  public fromJson(json: string): this;
  public fromJson(json: Record<string, any>): this;
  public fromJson(json: string | Record<string, any> = {}): this {
    return fromJson(this, json);
  }
}

/** Functions used when hydrating data */
export type FromJsonStrategy = (value: any) => any;

/** Functions used when dehydrating data */
export type ToJsonStrategy = (value: any) => any;

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

/** Function to build a `fromJsonStrategy` or `toJsonStrategy`.
 * Converts value from functions provided as parameters
 */
export function composeStrategy(
  ...fns:
    | (FromJsonStrategy | FromJsonStrategy[])[]
    | (ToJsonStrategy | ToJsonStrategy[])[]
): FromJsonStrategy | ToJsonStrategy {
  return (val: unknown): unknown =>
    fns.flat().reduce(
      (acc: unknown, f: FromJsonStrategy | ToJsonStrategy) => f(acc),
      val,
    );
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
): Record<string, unknown> {
  const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
    context?.constructor?.prototype,
  );

  if (!serializablePropertyMap) {
    throw new Error(
      `${ERROR_MESSAGE_MISSING_PROPERTIES_MAP}: ${context?.constructor
        ?.prototype}`,
    );
  }
  const record: Record<string, unknown> = {};
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
      record[serializedKey] = value.map((v: any) => toJsonStrategy(v));
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
function fromJson<T>(context: Serializable, json: string): T;

function fromJson<T>(context: Serializable, json: Record<string, any>): T;

function fromJson<T>(
  context: Serializable,
  json: string | Record<string, any>,
): T;

function fromJson<T>(
  context: Serializable,
  json: string | Record<string, any>,
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
      function revive(key: string, value: unknown): unknown {
        // After the last iteration of the fromJsonStrategy a function
        // will be called one more time with a empty string key
        if (key === "") {
          return value;
        }

        const {
          propertyKey,
          // default no-op
          fromJsonStrategy = (v: unknown) => v,
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
