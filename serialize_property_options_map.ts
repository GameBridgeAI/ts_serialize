import { SerializePropertyOptions } from "./serializable.ts";

export const DUPLICATE_PROPERTY_KEY_ERROR_MESSAGE =
  "This key name is already in use by another property, please use a different name";

export const DUPLICATE_SERIALIZE_KEY_ERROR_MESSAGE =
  "This serialize key is already in use by another property, please use a different name";

/** Double indexed map of Serialized Property Options
 * The property options of a Serialize Property can be looked up by both the
 * property key on the original object, and the serialized property key used
 * in json
 *
 * When adding a key to the map that overlaps the property key or the serialize
 * key of a parent key any parent entries using those keys will be ignored, even
 * if no entry for the child map exists
 */
export class SerializePropertyOptionsMap {
  private propertyKeyMap = new Map<string | symbol, SerializePropertyOptions>();
  private serializedKeyMap = new Map<string, SerializePropertyOptions>();

  // Set of serialized keys to ignore. This is to hide serialized keys on the parent
  // when a different property key is overridden for the same serialized key
  private propertyKeyIgnoreSet = new Set<string | symbol>();
  private serializedKeyIgnoreSet = new Set<string>();

  constructor(private parentMap?: SerializePropertyOptionsMap) {}

  /** Setting a key will throw an error if there are key collisions with either
   * an existing property key or serialized key
   */
  public set(serializePropertyOptions: SerializePropertyOptions): void {
    if (this.serializedKeyMap.has(serializePropertyOptions.serializedKey)) {
      throw new Error(
        `${DUPLICATE_SERIALIZE_KEY_ERROR_MESSAGE}: ${serializePropertyOptions.serializedKey}`
      );
    }
    if (this.propertyKeyMap.has(serializePropertyOptions.propertyKey)) {
      throw new Error(
        `${DUPLICATE_PROPERTY_KEY_ERROR_MESSAGE}: ${serializePropertyOptions.propertyKey.toString()}`
      );
    }
    this.propertyKeyIgnoreSet.delete(serializePropertyOptions.propertyKey);
    this.propertyKeyMap.set(
      serializePropertyOptions.propertyKey,
      serializePropertyOptions
    );

    this.serializedKeyIgnoreSet.delete(serializePropertyOptions.serializedKey);
    this.serializedKeyMap.set(
      serializePropertyOptions.serializedKey,
      serializePropertyOptions
    );

    // Hide parent property key mappings for previous value of serialized key
    const parentSerializedObject = this.parentMap?.getBySerializedKey(
      serializePropertyOptions.serializedKey
    );
    if (
      parentSerializedObject &&
      parentSerializedObject.propertyKey !==
        serializePropertyOptions.propertyKey
    ) {
      this.propertyKeyIgnoreSet.add(parentSerializedObject.propertyKey);
    }
    // Hide parent serializedKey mapping for previous value of property key
    const parentPropertyObject = this.parentMap?.getByPropertyKey(
      serializePropertyOptions.propertyKey
    );
    if (
      parentPropertyObject &&
      parentPropertyObject.serializedKey !==
        serializePropertyOptions.serializedKey
    ) {
      this.serializedKeyIgnoreSet.add(parentPropertyObject.serializedKey);
    }
  }

  public hasPropertyKey(propertyKey: string | symbol): boolean {
    return (
      this.propertyKeyMap.has(propertyKey) ||
      (!this.propertyKeyIgnoreSet.has(propertyKey) &&
        this.parentMap?.hasPropertyKey(propertyKey)) ||
      false
    );
  }

  public getByPropertyKey(
    propertyKey: string | symbol
  ): SerializePropertyOptions | undefined {
    return (
      this.propertyKeyMap.get(propertyKey) ||
      (!this.propertyKeyIgnoreSet.has(propertyKey) &&
        this.parentMap?.getByPropertyKey(propertyKey)) ||
      undefined
    );
  }

  public hasSerializedKey(serializedKey: string): boolean {
    return (
      this.serializedKeyMap.has(serializedKey) ||
      (!this.serializedKeyIgnoreSet.has(serializedKey) &&
        this.parentMap?.hasSerializedKey(serializedKey)) ||
      false
    );
  }

  public getBySerializedKey(
    serializedKey: string
  ): SerializePropertyOptions | undefined {
    return (
      this.serializedKeyMap.get(serializedKey) ||
      (!this.serializedKeyIgnoreSet.has(serializedKey) &&
        this.parentMap?.getBySerializedKey(serializedKey)) ||
      undefined
    );
  }

  /** Get a map of all property entries for this map,
   * including parent entires, excluding any ignored parent properties
   */
  private getMergedWithParentMap(): Map<
    string | symbol,
    SerializePropertyOptions
  > {
    let parentEntries = Array.from(
      this.parentMap?.getMergedWithParentMap() || []
    );
    return new Map([
      ...parentEntries.filter((e) => !this.propertyKeyIgnoreSet.has(e[0])),
      ...this.propertyKeyMap,
    ]);
  }

  public propertyOptions(): Iterable<SerializePropertyOptions> {
    return this.getMergedWithParentMap().values();
  }
}
