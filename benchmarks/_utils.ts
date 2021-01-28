// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

export const only = Deno.args.includes("--benchmark");
export const ignore = !only;

export enum TestAmount {
  Ten = 10,
  OneMillion = 1e6,
}

export class Root extends Serializable {
  @SerializeProperty()
  property: string = "default";
}

export const input = {
  property: "from_input",
};
