declare module "@gamebridgeai/ts_serialize" {
  /** Adds methods for serialization */
  export abstract class Serializable {
    public toJson(): string;
    public fromJson(): this;
    public fromJson(json: string): this;
    public fromJson(json: Record<string, any>): this;
    public fromJson(json: string | Record<string, any>): this;
  }

  /** Functions used when hydrating data */
  export type FromJsonStrategy = (value: any) => any;

  /** Functions used when dehydrating data */
  export type ToJsonStrategy = (value: any) => any;

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

  /** Function to build a `fromJsonStrategy` or `toJsonStrategy`.
   * Converts value from functions provided as parameters
   */
  export function composeStrategy(
    ...fns:
      | (FromJsonStrategy | FromJsonStrategy[])[]
      | (ToJsonStrategy | ToJsonStrategy[])[]
  ): FromJsonStrategy | ToJsonStrategy;

  /** revive data using `fromJson` on a subclass type */
  export function fromJsonAs<T>(
    type: T & { new (): Serializable },
  ): FromJsonStrategy;

  /** allows authors to pass a regex to parse as a date */
  export function createDateStrategy(regex: RegExp): FromJsonStrategy;

  /** Changed from
   * @see https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates
   */
  export const ISODateFromJson: FromJsonStrategy;
}
