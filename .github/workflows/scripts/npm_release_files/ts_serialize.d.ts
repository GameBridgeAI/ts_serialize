declare module "@gamebridgeai/ts_serialize" {
  /** A JSON object where each property value is a simple JSON value. */
  export type JSONObject = { [key: string]: JSONValue };

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
  export interface TransformKey {
    /** a function that will be called against
     * every property key transforming the key
     * with the provided function
     */
    tsTransformKey(key: string): string;
  }
  /** to be implemented by external authors on their models  */
  export interface ToJSON {
    /** to JSON String */
    toJSON(): string;
  }
  /** to be implemented by external authors on their models  */
  export interface FromJSON {
    /** to Serializable Object */
    fromJSON(json: string | JSONValue | Object): this;
  }
  /** to be implemented by external authors on their models  */
  export interface Serialize {
    /** to JSONObject */
    tsSerialize(): JSONObject;
  }
  /** Adds methods for serialization */
  export abstract class Serializable {
    /** key transform functionality */
    public tsTransformKey?(key: string): string;
    /** to JSON String */
    public toJSON?(): string;
    /** to Serializable */
    public fromJSON?(json: string | JSONValue | Object): this;
    /** to JSONObject */
    public tsSerialize?(): JSONObject;
  }

  /** Functions used when hydrating data */
  export type FromJSONStrategy = (value: JSONValue) => any;
  export type FromJSONStrategyArgument =
    (FromJSONStrategy | FromJSONStrategy[])[];

  /** Functions used when dehydrating data */
  export type ToJSONStrategy = (value: any) => JSONValue;
  export type ToJSONStrategyArgument = (ToJSONStrategy | ToJSONStrategy[])[];

  /** string/symbol property name or options for (de)serializing values */
  export type SerializePropertyArgument =
    | string
    | {
      serializedKey?: string;
      fromJSONStrategy?:
        | FromJSONStrategy
        | FromJSONStrategyArgument;
      toJSONStrategy?:
        | ToJSONStrategy
        | ToJSONStrategyArgument;
    };

  /** Property wrapper that adds serializable options to the class map
   * using options, `serializedName` as the key or `propertyName` if
   * `serializedName` is not set
   */
  export function SerializeProperty(
    arg?: string | SerializePropertyArgument,
  ): PropertyDecorator;

  /** Function to build a `fromJSONStrategy` or `toJSONStrategy`.
   * Converts value from functions provided as parameters
   */
  export function composeStrategy(
    ...fns:
      | FromJSONStrategyArgument
      | ToJSONStrategyArgument
  ): FromJSONStrategy | ToJSONStrategy;

  /** revive data using `fromJSON` on a subclass type */
  export function toSerializable<T>(
    type: T & { new (): Serializable },
  ): FromJSONStrategy;

  /** revive data from `{k: v}` using `fromJSON` on a subclass type `v` */
  export function toObjectContaining<T>(
    type: T & { new (): Serializable },
  ): FromJSONStrategy;

  /** convert `{ [_: string]: Serializable }` to `{ [_: string]: Serializable.toSerialize() }` */
  export function fromObjectContaining(
    value: Record<string, Serializable | Serializable[]>,
  ): JSONObject;

  /** allows authors to pass a regex to parse as a date */
  export function createDateStrategy(regex: RegExp): FromJSONStrategy;

  /** Changed from
   * @see https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates
   */
  export function iso8601Date(input: JSONValue): any;

  export type InitializerFunction = () => Serializable;

  export type ResolverFunction = (
    input: string | JSONValue | Object,
  ) => Serializable;

  export function polymorphicClassFromJSON<T extends Serializable>(
    classPrototype: Object & { prototype: T },
    input: string | JSONValue | Object,
  ): T;

  export function PolymorphicResolver(
    target: unknown,
    propertyKey: string | symbol,
  ): void;

  export function PolymorphicSwitch(
    initializerFunction: InitializerFunction,
    value?: unknown,
  ): PropertyDecorator;
}
