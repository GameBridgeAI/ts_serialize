#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

/** Find and read all .md files in a given directory or the current directory
 * if no arguments are given, parse each .md file for typescript code blocks
 * and run the code in the codeblock
 *
 * @argument directory - string path to the head of the directory stack
 * @default "." - the currect location from where the script was run
 *
 * @example
 * ```bash
 * ./_test_markdown.ts
 * ./_test_markdown.ts directory
 * ```
 */

import { walk } from "https://deno.land/std@0.133.0/fs/mod.ts";

enum CodeBlockToken {
  StartTs = "```ts",
  StartTypescript = "```typescript",
  End = "```",
}

interface TestSuite {
  startLine: number;
  endLine: number;
  testCode: string;
}

/** build a testSuite from all .md files */
const testSuites = new Map<string, TestSuite[]>();

for await (const { path } of walk(Deno.args[0] || ".", { exts: [".md"] })) {
  testSuites.set(path, []);
  const testLines: string[] = [];
  let readingCodeBlock = false;
  let currentLine = 0;
  let startLine = 0;

  for (const line of (await Deno.readTextFile(path)).split("\n")) {
    currentLine += 1;

    if (
      !readingCodeBlock &&
      (line.includes(CodeBlockToken.StartTs) ||
        line.includes(CodeBlockToken.StartTypescript))
    ) {
      readingCodeBlock = true;
      startLine = currentLine;
      continue;
    }

    if (readingCodeBlock && line.includes(CodeBlockToken.End)) {
      readingCodeBlock = false;
      testSuites.set(
        path,
        [...(testSuites.get(path) ?? []), {
          startLine,
          endLine: currentLine,
          testCode: testLines.join("\n"),
        }],
      );
      testLines.length = 0;
      continue;
    }

    if (readingCodeBlock) {
      testLines.push(line);
    }
  }

  if ((testSuites.get(path) ?? []).length === 0) {
    testSuites.delete(path);
  }
}

/** run the testSuites and stop process with `code` when `success` fails */
let exitCode = 0;
for (const [file, tests] of testSuites.entries()) {
  for (const { startLine, endLine, testCode } of tests) {
    const path = `${file}:${startLine}-${endLine}.ts`;

    try {
      await Deno.writeTextFile(path, testCode);
      const { success, code } = await Deno.run({ cmd: ["deno", "test", path] })
        .status();

      if (!success) {
        exitCode = code;
      }
    } finally {
      await Deno.remove(path);

      if (exitCode) {
        Deno.exit(exitCode);
      }
    }
  }
}
