// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

/** find and read all .md files in a given directory or the current directory
 * if no arguments are given, parse each .md file for typescript code blocks
 * and run the code in the codeblock */

import { walk } from "https://deno.land/std@0.133.0/fs/mod.ts";

enum CodeBlockTokens {
  StartTs = "```ts",
  StartTypescript = "```typescript",
  End = "```",
}

/** build a testSuite from all .md files */
const testSuite = new Map();

for await (const { path } of walk(Deno.args[0] || ".", { exts: [".md"] })) {
  testSuite.set(path, []);
  const testLines = [];
  let readingCodeBlock = false;
  let currentLine = 0;
  let startLine = 0;

  for (const line of (await Deno.readTextFile(path)).split("\n")) {
    currentLine += 1;
    if (
      !readingCodeBlock &&
      (line === CodeBlockTokens.StartTs ||
        line === CodeBlockTokens.StartTypescript)
    ) {
      readingCodeBlock = true;
      startLine = currentLine;
      continue;
    }

    if (readingCodeBlock && line === CodeBlockTokens.End) {
      readingCodeBlock = false;
      testSuite.set(
        path,
        [...testSuite.get(path), {
          startLine,
          endLine: currentLine,
          test: testLines.join("\n"),
        }],
      );
      testLines.length = 0;
      continue;
    }

    if (readingCodeBlock) {
      testLines.push(line);
    }
  }

  if (testSuite.get(path).length === 0) {
    testSuite.delete(path);
  }
}
/** run the testSuite, and stop process with `code` with `sucess` fails */
for (const [file, tests] of testSuite.entries()) {
  for (const { startLine, endLine, test } of tests) {
    const path = `${file}:${startLine}-${endLine}.ts`;
    await Deno.writeTextFile(path, test);
    const { success, code } = await Deno.run({ cmd: ["deno", "test", path] })
      .status();
    await Deno.remove(path);
    if (!success) {
      Deno.exit(code);
    }
  }
}
