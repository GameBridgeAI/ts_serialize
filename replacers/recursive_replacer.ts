import { toPojo, Serializable } from "../serializable.ts";

export function recursiveReplacer<T>(value: any): any {
  return toPojo(value);
};