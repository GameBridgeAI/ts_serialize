// Copyright 2018-2021 Gamebridge.ai authors. All rights reserved. MIT license.

import { test } from "../test_deps.ts";
import { ignore, input, only, Root, TestAmount } from "./_utils.ts";

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
    const fromJSONMeasured = performance.getEntriesByName(
      "measure_fromJSON_benchmark_1m",
    );

    const avg = fromJSONMeasured.reduce((acc, { duration }) =>
      acc + duration, 0) /
      fromJSONMeasured.length;
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
    const toJSONMeasured = performance.getEntriesByName(
      "measure_toJSON_benchmark_1m",
    );
    const avg = toJSONMeasured.reduce((acc, { duration }) =>
      acc + duration, 0) /
      toJSONMeasured.length;
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

    const tsSerializeMeasured = performance.getEntriesByName(
      "measure_tsSerialize_benchmark_1m",
    );
    const avg = tsSerializeMeasured.reduce((acc, { duration }) =>
      acc + duration, 0) /
      tsSerializeMeasured.length;
    console.log(avg);
  },
});
