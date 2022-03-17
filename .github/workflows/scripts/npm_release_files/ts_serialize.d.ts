declare module "@gamebridgeai/ts_serialize" {
  /** A JSON object where each property value is a simple JSON value. */
  export type JSONObject = { [key: string]: JSONValue };

  /** A property value in a JSON object. */
  export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject
    | JSONValue[];

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
    fromJSON(json: JSONValue): this;
  }
  /** to be implemented by external authors on their models  */
  export interface Serialize {
    /** to JSONObject */
    tsSerialize(): JSONObject;
  }
  /** deep copy `this` */
  export interface Clone {
    clone(jsonObject: Partial<this>): this;
  }

  /** Adds methods for serialization */
  export abstract class Serializable {
    /** key transform functionality */
    public tsTransformKey(key: string): string;
    /** to JSON String */
    public toJSON(): string;
    /** to Serializable */
    public fromJSON(json: JSONValue): this;
    /** to JSONObject */
    public tsSerialize(): JSONObject;
    /** deep copy `this` */
    public clone(jsonObject: Partial<this>): this;
  }

  type NewSerializable<T> = T & (new () => Serializable);
  type FunctionSerializable = () => Serializable;

  /** get new strategy type arguments */
  export function getNewSerializable(
    type: unknown,
  ): Serializable;

  /** Functions used when hydrating data */
  // deno-lint-ignore no-explicit-any
  export type Strategy = (value: any) => any;

  /** string/symbol property name or options for (de)serializing values */
  export type SerializePropertyArgument =
    | string
    | {
      serializedKey?: string;
      fromJSONStrategy?: Strategy;
      toJSONStrategy?: Strategy;
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
    ...fns: Strategy[]
  ): Strategy;

  /** revive data using `fromJSON` on a subclass type */
  export function toSerializable(
    type: unknown,
  ): Strategy;

  /** serialize data using `tsSerialize` on a subclass Serializable type */
  export function fromSerializable(): Strategy;

  /** revive data from `{k: v}` using `fromJSON` on a subclass type `v` */
  export function toObjectContaining(
    type: unknown,
  ): Strategy;

  /** convert `{ [_: string]: Serializable }` to `{ [_: string]: Serializable.toSerialize() }` */
  export function fromObjectContaining(): Strategy;

  /** allows authors to pass a regex to parse as a date */
  export function createDateStrategy(regex: RegExp): Strategy;

  /** Changed from
   * @see https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates
   */
  export function iso8601Date(): Strategy;

  export type InitializerFunction = () => Serializable;

  export type PropertyValueTest = (propertyValue: unknown) => boolean;

  export type ResolverFunction = (
    json: JSONValue,
  ) => Serializable;

  export function polymorphicClassFromJSON<T extends Serializable>(
    classPrototype: unknown & { prototype: T },
    json: JSONValue,
  ): T;
  /** Adds a class and a resolver function to the resolver map */
  export function PolymorphicResolver(
    target: unknown,
    propertyKey: string | symbol,
  ): void;

  /**
   * \@PolymorphicSwitch property decorator.
   *
   * Maps the provided initializer function and value or propertyValueTest to the parent class
   */
  export function PolymorphicSwitch(
    initializerFunction: InitializerFunction,
    propertyValueTest: PropertyValueTest,
  ): PropertyDecorator;

  export function PolymorphicSwitch<T>(
    initializerFunction: InitializerFunction,
    value: Exclude<T, PropertyValueTest>,
  ): PropertyDecorator;
}
