import { toPojo, Serializable } from "../serializable.ts";

export function recursiveReplacer<T>(value: Serializable<T>): any {
  return toPojo(value);
};