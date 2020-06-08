import { toPojo } from "../serializable.ts";

export function recursiveReplacer<T>(value: any): any {
  return toPojo(value);
}
