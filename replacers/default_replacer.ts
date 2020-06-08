// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.

/** 
 * Use the default replacer logic 
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify -> The replacer parameter
*/
export function defaultReplacer(value: any): any {
  return value;
}
