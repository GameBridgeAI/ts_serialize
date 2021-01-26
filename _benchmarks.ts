// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { Serializable } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";
import { toSerializable } from "./strategy/from_json/to_serializable.ts";

class Embedded extends Serializable {
  @SerializeProperty()
  public field1?: string;
}

class Root extends Serializable {
  @SerializeProperty()
  field1?: string;
  @SerializeProperty({ fromJSONStrategy: toSerializable(Embedded) })
  public embedded?: Embedded[];
}

const input = {
  field1: "field_value_in_outer_class",
  embedded: [
    { field1: "field_value_in_inner_class" },
  ],
};

for (let i = 0; i < 10; i++) {
  performance.mark(`start_benchmark_1m_${i}`);
  for (let j = 0; j < 1e6; j++) {
    new Root().fromJSON(input);
  }
  performance.mark(`end_benchmark_1m_${i}`);
  performance.measure(
    "measure_benchmark_1m",
    `start_benchmark_1m_${i}`,
    `end_benchmark_1m_${i}`,
  );
}

const measured = performance.getEntriesByName("measure_benchmark_1m");

console.log(
  measured,
  `average: ${measured.reduce(
    (acc, { duration }) => acc + duration,
    0,
  ) / measured.length}`,
);
