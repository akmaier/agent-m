# Implementation Job Cases

## implementation starts with failing tests

### Case

```json
{
  "job": { "kind": "implement", "modules": ["MOD-product-process"] },
  "facts": {
    "pullRequest": { "number": 413 },
    "commits": [
      { "sha": "aaaaaaa111111111111111111111111111111111", "ci": "failure", "files": ["tests/product-process-release.test.mjs"] },
      { "sha": "bbbbbbb222222222222222222222222222222222", "ci": "success", "files": ["src/product-process/done.mjs"] }
    ],
    "checks": [],
    "reviews": [],
    "files": [
      { "path": "tests/product-process-release.test.mjs", "change": "added" },
      { "path": "src/product-process/done.mjs", "change": "modified" }
    ],
    "texts": {
      "head:tests/product-process-release.test.mjs": "// TST-413901\n// level: release\n// module: MOD-product-process\n// guards: AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST\n// given: a pull request whose first commit has only this test and red CI\n// input: doneCheck\n// expect: no finding\ntest(\"red first\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "expected": []
}
```

## implementation starts with code

### Case

```json
{
  "job": { "kind": "implement", "modules": ["MOD-product-process"] },
  "facts": {
    "pullRequest": { "number": 413 },
    "commits": [
      { "sha": "ccccccc333333333333333333333333333333333", "ci": "failure", "files": ["tests/product-process-release.test.mjs", "src/product-process/done.mjs"] },
      { "sha": "ddddddd444444444444444444444444444444444", "ci": "success", "files": ["src/product-process/done.mjs"] }
    ],
    "checks": [],
    "reviews": [],
    "files": [
      { "path": "tests/product-process-release.test.mjs", "change": "added" },
      { "path": "src/product-process/done.mjs", "change": "modified" }
    ],
    "texts": {
      "head:tests/product-process-release.test.mjs": "// TST-413902\n// level: release\n// module: MOD-product-process\n// guards: AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST\n// given: a pull request whose first commit also changes code\n// input: doneCheck\n// expect: one finding names the code file in the first commit\ntest(\"code first\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "expected": [
    {
      "artifact": "src/product-process/done.mjs",
      "line": 1,
      "kind": "error",
      "rule": "AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST",
      "what": "the first commit ccccccc changes files that are no tests: src/product-process/done.mjs",
      "fix": "commit only the tests first"
    }
  ]
}
```

## refactoring stays green and moves a test

### Case

```json
{
  "job": { "kind": "refactor", "modules": ["MOD-product-process"] },
  "facts": {
    "pullRequest": { "number": 413 },
    "commits": [
      { "sha": "eeeeeee555555555555555555555555555555555", "ci": "success", "files": ["tests/product-process-done.test.mjs"] },
      { "sha": "fffffff666666666666666666666666666666666", "ci": "success", "files": ["src/product-process/done.mjs"] }
    ],
    "checks": [],
    "reviews": [],
    "files": [
      { "path": "tests/product-process-done.test.mjs", "change": "modified" },
      { "path": "src/product-process/done.mjs", "change": "modified" }
    ],
    "texts": {
      "base:tests/product-process-done.test.mjs": "// TST-413903\n// level: release\n// module: MOD-product-process\n// guards: A REFACTORING JOB CHANGES NO EXPECTED RESULT\n// given: a refactoring keeps this assertion\n// input: doneCheck\n// expect: no finding\ntest(\"kept\", () => {\n  assert.deepEqual(list(), []);\n});\n",
      "head:tests/product-process-done.test.mjs": "const moved = true;\n// TST-413903\n// level: release\n// module: MOD-product-process\n// guards: A REFACTORING JOB CHANGES NO EXPECTED RESULT\n// given: a refactoring keeps this assertion\n// input: doneCheck\n// expect: no finding\ntest(\"kept\", () => {\n  assert.deepEqual(list(), []);\n});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "expected": []
}
```

## refactoring has a red commit

### Case

```json
{
  "job": { "kind": "refactor", "modules": ["MOD-product-process"] },
  "facts": {
    "pullRequest": { "number": 413 },
    "commits": [
      { "sha": "9999999777777777777777777777777777777777", "ci": "failure", "files": ["tests/product-process-done.test.mjs"] }
    ],
    "checks": [],
    "reviews": [],
    "files": [
      { "path": "tests/product-process-done.test.mjs", "change": "modified" }
    ],
    "texts": {
      "base:tests/product-process-done.test.mjs": "// TST-413904\n// level: release\n// module: MOD-product-process\n// guards: A REFACTORING JOB BEGINS WITHOUT A FAILING TEST\n// given: a refactoring with red CI\n// input: doneCheck\n// expect: one finding names the red commit\ntest(\"red\", () => {\n  assert.deepEqual(list(), []);\n});\n",
      "head:tests/product-process-done.test.mjs": "// TST-413904\n// level: release\n// module: MOD-product-process\n// guards: A REFACTORING JOB BEGINS WITHOUT A FAILING TEST\n// given: a refactoring with red CI\n// input: doneCheck\n// expect: one finding names the red commit\ntest(\"red\", () => {\n  assert.deepEqual(list(), []);\n});\n"
    }
  },
  "expected": [
    {
      "artifact": "pull request #413",
      "line": 1,
      "kind": "error",
      "rule": "CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI",
      "what": "CI is not green on the head commit: its result is failure",
      "fix": "repair the failure and push"
    },
    {
      "artifact": "pull request #413",
      "line": 1,
      "kind": "error",
      "rule": "A REFACTORING JOB BEGINS WITHOUT A FAILING TEST",
      "what": "CI was not green on commit 9999999: its result is failure",
      "fix": "keep every commit green in a refactoring job"
    }
  ]
}
```

## refactoring changes an asserted value

### Case

```json
{
  "job": { "kind": "refactor", "modules": ["MOD-product-process"] },
  "facts": {
    "pullRequest": { "number": 413 },
    "commits": [
      { "sha": "abababa888888888888888888888888888888888", "ci": "success", "files": ["tests/product-process-done.test.mjs"] }
    ],
    "checks": [],
    "reviews": [],
    "files": [
      { "path": "tests/product-process-done.test.mjs", "change": "modified" }
    ],
    "texts": {
      "base:tests/product-process-done.test.mjs": "// TST-413905\n// level: release\n// module: MOD-product-process\n// guards: A REFACTORING JOB CHANGES NO EXPECTED RESULT\n// given: a refactoring changes an asserted value\n// input: doneCheck\n// expect: one finding names the changed assertion\ntest(\"value\", () => {\n  assert.deepEqual(list(), []);\n});\n",
      "head:tests/product-process-done.test.mjs": "// TST-413905\n// level: release\n// module: MOD-product-process\n// guards: A REFACTORING JOB CHANGES NO EXPECTED RESULT\n// given: a refactoring changes an asserted value\n// input: doneCheck\n// expect: one finding names the changed assertion\ntest(\"value\", () => {\n  assert.deepEqual(list(), [1]);\n});\n"
    }
  },
  "expected": [
    {
      "artifact": "tests/product-process-done.test.mjs",
      "line": 1,
      "kind": "error",
      "rule": "A REFACTORING JOB CHANGES NO EXPECTED RESULT",
      "what": "the assertion assert.deepEqual(list(), []); of tests/product-process-done.test.mjs is changed or gone",
      "fix": "a refactoring changes no expected result: restore the assertion"
    }
  ]
}
```

## implementation changes another module

### Case

```json
{
  "job": { "kind": "implement", "modules": ["MOD-product-process"] },
  "facts": {
    "pullRequest": { "number": 413 },
    "commits": [
      { "sha": "bcbcbcb999999999999999999999999999999999", "ci": "failure", "files": ["tests/product-process-release.test.mjs"] },
      { "sha": "cdcdcdcabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "ci": "success", "files": ["src/other/ghost.mjs"] }
    ],
    "checks": [],
    "reviews": [],
    "files": [
      { "path": "tests/product-process-release.test.mjs", "change": "added" },
      { "path": "src/other/ghost.mjs", "change": "modified" }
    ],
    "texts": {
      "head:tests/product-process-release.test.mjs": "// TST-413906\n// level: release\n// module: MOD-product-process\n// guards: AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES\n// given: a pull request changes a code file outside the job module\n// input: doneCheck\n// expect: one finding names the outside file\ntest(\"outside\", () => {});\n",
      "head:src/other/ghost.mjs": "export const ghost = true;\n"
    }
  },
  "expected": [
    {
      "artifact": "src/other/ghost.mjs",
      "line": 1,
      "kind": "error",
      "rule": "AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES",
      "what": "src/other/ghost.mjs lies in the folder of none of the job's modules (MOD-product-process)",
      "fix": "change only the files of the modules the item names, or add the module to the item"
    }
  ]
}
```
