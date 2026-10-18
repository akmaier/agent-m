# Definition of Done Cases

Every case is a pull request of the fixture facts, checked with the workflow that MOD-product-process' `workflowOf` gives for this repository's own `docs/process.md`. `declare` lines are added under its `## Definition of Done`, each as a line without a list dash. `gates` are the pull request's own gate records of the gate Development → Release testing; `expected` are the findings as `[artifact, rule, what]`.

## default: every job rule met

### Case

```json
{
  "group": "default",
  "declare": [],
  "workflowDoneExtra": [],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "success",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "https://example.test/checks/1"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [
    "passed"
  ],
  "expected": [],
  "mergeable": true
}
```

## default: CI is red on the head commit

### Case

```json
{
  "group": "default",
  "declare": [],
  "workflowDoneExtra": [],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "failure",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "https://example.test/checks/1"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [
    "passed"
  ],
  "expected": [
    [
      "pull request #834",
      "CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI",
      "CI is not green on the head commit: its result is failure"
    ]
  ],
  "mergeable": false
}
```

## default: the first commit also holds code

### Case

```json
{
  "group": "default",
  "declare": [],
  "workflowDoneExtra": [],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs",
          "src/product-process/done.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "success",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "https://example.test/checks/1"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [
    "passed"
  ],
  "expected": [
    [
      "src/product-process/done.mjs",
      "AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST",
      "the first commit 1111111 changes files that are no tests: src/product-process/done.mjs"
    ]
  ],
  "mergeable": false
}
```

## default: the gate before the merge is rejected

### Case

```json
{
  "group": "default",
  "declare": [],
  "workflowDoneExtra": [],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "success",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "https://example.test/checks/1"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [
    "rejected"
  ],
  "expected": [
    [
      "pull request #834",
      "THE GATE IS RECORDED",
      "the gate Development → Release testing is not recorded as passed: rejected"
    ]
  ],
  "mergeable": false
}
```

## default: the gate before the merge has no record

### Case

```json
{
  "group": "default",
  "declare": [],
  "workflowDoneExtra": [],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "success",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "https://example.test/checks/1"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [],
  "expected": [
    [
      "pull request #834",
      "THE GATE IS RECORDED",
      "the gate Development → Release testing is not recorded as passed: pending"
    ]
  ],
  "mergeable": false
}
```

## declared: check lint declared and succeeded

### Case

```json
{
  "group": "declared",
  "declare": [
    "check: lint"
  ],
  "workflowDoneExtra": [
    "check: lint"
  ],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "success",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "u"
      },
      {
        "name": "lint",
        "state": "success",
        "url": "u"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [
    "passed"
  ],
  "expected": [],
  "mergeable": true
}
```

## declared: check lint declared and missing

### Case

```json
{
  "group": "declared",
  "declare": [
    "check: lint"
  ],
  "workflowDoneExtra": [
    "check: lint"
  ],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "success",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "https://example.test/checks/1"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [
    "passed"
  ],
  "expected": [
    [
      "pull request #834",
      "A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS",
      "the condition check: lint does not hold: the check lint has not succeeded"
    ]
  ],
  "mergeable": false
}
```

## declared: check lint declared and missing, every job rule met without it

### Case

```json
{
  "group": "declared",
  "declare": [],
  "workflowDoneExtra": [],
  "job": {
    "kind": "implement",
    "modules": [
      "MOD-product-process"
    ]
  },
  "facts": {
    "pullRequest": {
      "number": 834
    },
    "commits": [
      {
        "sha": "1111111111111111111111111111111111111111",
        "ci": "failure",
        "files": [
          "tests/product-process-done.test.mjs"
        ]
      },
      {
        "sha": "2222222222222222222222222222222222222222",
        "ci": "success",
        "files": [
          "src/product-process/done.mjs",
          "tests/product-process-done.test.mjs"
        ]
      }
    ],
    "checks": [
      {
        "name": "node",
        "state": "success",
        "url": "https://example.test/checks/1"
      }
    ],
    "reviews": [],
    "files": [
      {
        "path": "tests/product-process-done.test.mjs",
        "change": "added"
      },
      {
        "path": "src/product-process/done.mjs",
        "change": "modified"
      }
    ],
    "texts": {
      "head:tests/product-process-done.test.mjs": "// TST-834001 · level: unit · module: MOD-product-process\n// guards: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES\n// given: a pull request that meets every rule\n// input: doneCheck\n// expect: no finding\ntest(\"x\", () => {});\n",
      "head:src/product-process/done.mjs": "export const done = true;\n"
    }
  },
  "gates": [
    "passed"
  ],
  "expected": [],
  "mergeable": true
}
```
