#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

// Copyright 2018-2022 Gamebridge.ai authors. All rights reserved. MIT license.

import { walk } from "https://deno.land/std@0.133.0/fs/mod.ts";
import { parse } from "https://deno.land/std@0.133.0/flags/mod.ts";
const { exit, writeTextFile, readTextFile, remove, args, run } = Deno;
const helpText = `
Find and read all markdown files in a given directory or the current directory \
if no arguments are given. Parse each markdown file for typescript code blocks \
and run the code in the codeblock.

Usage:
	./_test_markdown.ts [-f] [-l] [-d "."]
	./_test_markdown --help

Command line arguments:
	-h,  --help              Prints this help message, then exits.
	-d,  --directory=["."]   The directory to start a recrusive lookup for markdown files
	-l,  --lint=[false]      Adds a lint check before testing, exit on failure
	-f,  --fmt=[false]       Adds a fmt check before testing, exit on failure
`;

function printHelpText(message = "") {
  if (message.length) {
    console.error(`\n${message}`);
    console.log(helpText);
    exit(1);
  }
  console.log(helpText);
  exit(0);
}

const flags = parse(args, {
  string: ["d"],
  boolean: ["h", "l", "f"],
  alias: { d: "directory", h: "help", l: "lint", f: "fmt" },
  default: { d: ".", l: false, f: false, h: false },
  unknown: () => printHelpText("Unknown argument"),
});

if (flags.h) {
  printHelpText();
}

if (!flags.d.length) {
  printHelpText("The directory argument must be a valid path");
}

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
try {
  for await (const { path } of walk(flags.d, { exts: [".md"] })) {
    testSuites.set(path, []);
    const testLines: string[] = [];
    let readingCodeBlock = false;
    let currentLine = 0;
    let startLine = 0;

    for (const line of (await readTextFile(path)).split("\n")) {
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
            testCode: `${testLines.join("\n")}\n`,
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
} catch (e) {
  printHelpText(e.message);
}
/** write test files */
const paths: string[] = [];
for (const [file, tests] of testSuites.entries()) {
  for (const { startLine, endLine, testCode } of tests) {
    const path = `${file}$${startLine}-${endLine}.ts`;

    try {
      await writeTextFile(path, testCode);
      paths.push(path);
    } catch (e) {
      for (const path of paths) {
        await remove(path);
      }
      console.error(e.message);
      exit(1);
    }
  }
}
/** run the testSuites and stop process with `code` when `success` fails */
let exitCode = 0;
try {
  if (flags.l) {
    console.log("linting...");
    const { success, code } = await run({
      cmd: ["deno", "lint", ...paths],
    })
      .status();

    if (!success) {
      exitCode = code;
      throw new Error(`lint exited with code ${code}`);
    }
  }

  if (flags.f) {
    console.log("formatting...");
    const { success, code } = await run({
      cmd: ["deno", "fmt", "--check", ...paths],
    })
      .status();

    if (!success) {
      exitCode = code;
      throw new Error(`fmt exited with code ${code}`);
    }
  }

  const { success, code } = await run({
    cmd: ["deno", "test", ...paths],
  })
    .status();

  if (!success) {
    exitCode = code;
    throw new Error(`test exited with code ${code}`);
  }
} catch (e) {
  console.error(e.message);
} finally {
  for (const path of paths) {
    await remove(path);
  }
  exit(exitCode);
}
