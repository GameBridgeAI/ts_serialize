declare module "ts_serialize" {
  export abstract class Serializable {
    public toJson(): string;
    public fromJson(): this;
    public fromJson(json: string): this;
    public fromJson(json: Partial<this>): this;
    public fromJson(json: string | Partial<this>): this;
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

  interface SerializePropertyArgumentObject {
    serializedKey: string;
    fromJsonStrategy?:
      | FromJsonStrategy
      | (FromJsonStrategy | FromJsonStrategy[])[];
    toJsonStrategy?:
      | ToJsonStrategy
      | (ToJsonStrategy | ToJsonStrategy[])[];
  }

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
}
