// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

export const only = Deno.args.includes("--benchmark");
export const ignore = !only;

export enum TestAmount {
  Ten = 10,
  OneMillion = 1e6,
}
