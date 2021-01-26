// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { Serializable } from "./serializable.ts";
import { SerializeProperty } from "./serialize_property.ts";
import { toSerializable } from "./strategy/from_json/to_serializable.ts";
const TEST_TIMES = 10;
const MEASURE_TIMES = 1e6;

class Embedded extends Serializable {
  @SerializeProperty()
  public field1: string = "default";
}

class Root extends Serializable {
  @SerializeProperty()
  field1: string = "default";
  @SerializeProperty({ fromJSONStrategy: toSerializable(Embedded) })
  public embedded?: Embedded[] = [];
}

const input = {
  field1: "field_value_in_outer_class",
  embedded: [
    { field1: "field_value_in_inner_class" },
  ],
};

console.log("running fromJSON");
for (let i = 0; i < TEST_TIMES; i++) {
  performance.mark(`start_fromJSON_benchmark_1m_${i}`);
  for (let j = 0; j < MEASURE_TIMES; j++) {
    new Root().fromJSON(input);
  }
  performance.mark(`end_fromJSON_benchmark_1m_${i}`);
  performance.measure(
    "measure_fromJSON_benchmark_1m",
    `start_fromJSON_benchmark_1m_${i}`,
    `end_fromJSON_benchmark_1m_${i}`,
  );
}

const fromJSONMeasured = performance.getEntriesByName(
  "measure_fromJSON_benchmark_1m",
);

console.log(
  fromJSONMeasured,
  `\nfromJSON average: ${fromJSONMeasured.reduce(
    (acc, { duration }) => acc + duration,
    0,
  ) / fromJSONMeasured.length}`,
);

console.log("running toJSON");
for (let i = 0; i < TEST_TIMES; i++) {
  performance.mark(`start_toJSON_benchmark_1m_${i}`);
  for (let j = 0; j < MEASURE_TIMES; j++) {
    new Root().toJSON();
  }
  performance.mark(`end_toJSON_benchmark_1m_${i}`);
  performance.measure(
    "measure_toJSON_benchmark_1m",
    `start_toJSON_benchmark_1m_${i}`,
    `end_toJSON_benchmark_1m_${i}`,
  );
}

const toJSONMeasured = performance.getEntriesByName(
  "measure_toJSON_benchmark_1m",
);

console.log(
  toJSONMeasured,
  `\ntoJSON average: ${toJSONMeasured.reduce(
    (acc, { duration }) => acc + duration,
    0,
  ) / toJSONMeasured.length}`,
);

console.log("running tsSerialize");
for (let i = 0; i < TEST_TIMES; i++) {
  performance.mark(`start_tsSerialize_benchmark_1m_${i}`);
  for (let j = 0; j < MEASURE_TIMES; j++) {
    new Root().tsSerialize();
  }
  performance.mark(`end_tsSerialize_benchmark_1m_${i}`);
  performance.measure(
    "measure_tsSerialize_benchmark_1m",
    `start_tsSerialize_benchmark_1m_${i}`,
    `end_tsSerialize_benchmark_1m_${i}`,
  );
}

const tsSerializeMeasured = performance.getEntriesByName(
  "measure_tsSerialize_benchmark_1m",
);

console.log(
  tsSerializeMeasured,
  `\ntsSerialize average: ${tsSerializeMeasured.reduce(
    (acc, { duration }) => acc + duration,
    0,
  ) / tsSerializeMeasured.length}`,
);
