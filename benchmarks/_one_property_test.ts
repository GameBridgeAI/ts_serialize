// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { test } from "../test_deps.ts";
import { ignore, only, TestAmount } from "./_utils.ts";
import { Serializable } from "../serializable.ts";
import { SerializeProperty } from "../serialize_property.ts";

class Root extends Serializable {
  @SerializeProperty()
  property: string = "default";
}

const input = { property: "from_input" };

test({
  only,
  ignore,
  name:
    `Benchmark fromJSON() ${TestAmount.OneMillion} times and average out of ${TestAmount.Ten} runs`,
  fn() {
    for (let i = 0; i < TestAmount.Ten; i++) {
      performance.mark(`start_fromJSON_benchmark_1m_${i}`);
      for (let j = 0; j < TestAmount.OneMillion; j++) {
        new Root().fromJSON(input);
      }
      performance.mark(`end_fromJSON_benchmark_1m_${i}`);
      performance.measure(
        "measure_fromJSON_benchmark_1m",
        `start_fromJSON_benchmark_1m_${i}`,
        `end_fromJSON_benchmark_1m_${i}`,
      );
    }
    const measured = performance.getEntriesByName(
      "measure_fromJSON_benchmark_1m",
    );

    const avg = measured.reduce((acc, { duration }) => acc + duration, 0) /
      measured.length;
    console.log(avg);
  },
});

test({
  only,
  ignore,
  name:
    `Benchmark toJSON() ${TestAmount.OneMillion} times and average out of ${TestAmount.Ten} runs`,
  fn() {
    const root = new Root().fromJSON(input);
    for (let i = 0; i < TestAmount.Ten; i++) {
      performance.mark(`start_toJSON_benchmark_1m_${i}`);
      for (let j = 0; j < TestAmount.OneMillion; j++) {
        root.toJSON();
      }
      performance.mark(`end_toJSON_benchmark_1m_${i}`);
      performance.measure(
        "measure_toJSON_benchmark_1m",
        `start_toJSON_benchmark_1m_${i}`,
        `end_toJSON_benchmark_1m_${i}`,
      );
    }
    const measured = performance.getEntriesByName(
      "measure_toJSON_benchmark_1m",
    );
    const avg = measured.reduce((acc, { duration }) => acc + duration, 0) /
      measured.length;
    console.log(avg);
  },
});

test({
  only,
  ignore,
  name:
    `Benchmark tsSerialize() ${TestAmount.OneMillion} times and average out of ${TestAmount.Ten} runs`,
  fn() {
    const root = new Root().fromJSON(input);
    for (let i = 0; i < TestAmount.Ten; i++) {
      performance.mark(`start_tsSerialize_benchmark_1m_${i}`);
      for (let j = 0; j < TestAmount.OneMillion; j++) {
        root.tsSerialize();
      }
      performance.mark(`end_tsSerialize_benchmark_1m_${i}`);
      performance.measure(
        "measure_tsSerialize_benchmark_1m",
        `start_tsSerialize_benchmark_1m_${i}`,
        `end_tsSerialize_benchmark_1m_${i}`,
      );
    }

    const measured = performance.getEntriesByName(
      "measure_tsSerialize_benchmark_1m",
    );
    const avg = measured.reduce((acc, { duration }) => acc + duration, 0) /
      measured.length;
    console.log(avg);
  },
});
