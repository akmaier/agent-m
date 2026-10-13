# Derivation Class Cases

## classifier keeps participant classes and rule decisions

The precondition is that the existing artifacts hold `A SAMPLE RULE` and `A WRITE RULE`, and the input draft contains
one kept class of each participant class, one exact duplicate by rule and two candidates that state one new rule.

### Case

```json
{
  "input": {
    "kind": "classifier",
    "existing": [
      { "id": "A SAMPLE RULE", "keys": ["A SAMPLE RULE", "A reader reads a file whole."] },
      { "id": "A WRITE RULE", "keys": ["A WRITE RULE", "A writer writes a file whole."] }
    ],
    "candidates": [
      {
        "name": "A NEW RULE",
        "rule": "A reader keeps a trace.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 1",
        "class": "new"
      },
      {
        "name": "A SAMPLE RULE UPDATE",
        "rule": "A reader reads a file whole, or says why not.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 2",
        "class": "change",
        "of": "A SAMPLE RULE"
      },
      {
        "name": "RESTATES WRITE RULE",
        "rule": "A writer writes a file whole.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 3",
        "class": "new"
      },
      {
        "name": "A NEW RULE AGAIN",
        "rule": "A reader keeps a trace.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 4",
        "class": "new"
      },
      {
        "name": "A MODEL DUPLICATE",
        "rule": "",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 5",
        "class": "duplicate",
        "of": "A SAMPLE RULE"
      },
      {
        "name": "A CONFLICTING RULE",
        "rule": "A writer writes no files.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 6",
        "class": "conflict",
        "of": "A WRITE RULE"
      }
    ]
  },
  "expected": {
    "classes": [
      {
        "refs": ["A NEW RULE", "A NEW RULE AGAIN"],
        "from": ["ch. 1", "ch. 4"],
        "class": "new",
        "of": null,
        "decidedBy": "participant"
      },
      {
        "refs": ["A SAMPLE RULE UPDATE"],
        "from": ["ch. 2"],
        "class": "change",
        "of": "A SAMPLE RULE",
        "decidedBy": "participant"
      },
      {
        "refs": ["RESTATES WRITE RULE"],
        "from": ["ch. 3"],
        "class": "duplicate",
        "of": "A WRITE RULE",
        "decidedBy": "rule"
      },
      {
        "refs": ["A MODEL DUPLICATE"],
        "from": ["ch. 5"],
        "class": "duplicate",
        "of": "A SAMPLE RULE",
        "decidedBy": "participant"
      },
      {
        "refs": ["A CONFLICTING RULE"],
        "from": ["ch. 6"],
        "class": "conflict",
        "of": "A WRITE RULE",
        "decidedBy": "participant"
      }
    ]
  }
}
```

## job runner classes are written as queue entries

The precondition is that the product SPEC holds `A SAMPLE RULE`, `ANOTHER SAMPLE RULE` and `A WRITE RULE`, and the job
runner receives a draft that already names the existing artifacts for its change, duplicate and conflict classes.

### Case

```json
{
  "input": {
    "kind": "job-runner-and-queue",
    "source": "SRC-fixture-book",
    "productSpec": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**ANOTHER SAMPLE RULE** *(Product Owner)*\nA reader sees the name of a file.\n*Check:* no automatic check; at review\n\n## 2. Writing\n\n**A WRITE RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
    "candidates": [
      {
        "name": "A BETTER READING RULE",
        "rule": "A reader reads a file whole, or says why not.",
        "check": "`tests/better.test.mjs`",
        "constrains": "product",
        "passage": "ch. 8",
        "class": "change",
        "of": "A SAMPLE RULE"
      },
      {
        "name": "RESTATES THE WRITE RULE",
        "rule": "A writer writes a file whole.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 9",
        "class": "duplicate",
        "of": "A WRITE RULE"
      },
      {
        "name": "A WRITER NAMES ITS FILE",
        "rule": "A writer names the file it wrote.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 8",
        "class": "new"
      },
      {
        "name": "CONTRADICTS ANOTHER",
        "rule": "A reader sees nothing.",
        "check": "no automatic check; at review",
        "constrains": "product",
        "passage": "ch. 10",
        "class": "conflict",
        "of": "ANOTHER SAMPLE RULE"
      }
    ]
  },
  "expected": {
    "run": {
      "stoppedBecause": "passed",
      "remaining": [],
      "classes": [
        {
          "refs": ["A BETTER READING RULE"],
          "from": ["ch. 8"],
          "class": "change",
          "of": "A SAMPLE RULE",
          "decidedBy": "participant"
        },
        {
          "refs": ["RESTATES THE WRITE RULE"],
          "from": ["ch. 9"],
          "class": "duplicate",
          "of": "A WRITE RULE",
          "decidedBy": "rule"
        },
        {
          "refs": ["A WRITER NAMES ITS FILE"],
          "from": ["ch. 8"],
          "class": "new",
          "of": null,
          "decidedBy": "participant"
        },
        {
          "refs": ["CONTRADICTS ANOTHER"],
          "from": ["ch. 10"],
          "class": "conflict",
          "of": "ANOTHER SAMPLE RULE",
          "decidedBy": "participant"
        }
      ]
    },
    "writer": {
      "productCommits": 1,
      "instanceCommits": 0,
      "sections": [
        {
          "name": "01-reading.md",
          "text": "## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner; SRC-fixture-book, ch. 8)*\nA reader reads a file whole, or says why not.\n*Check:* `tests/better.test.mjs`\n\n**ANOTHER SAMPLE RULE** *(Product Owner)*\nA reader sees the name of a file.\n*Check:* no automatic check; at review\n\n"
        },
        {
          "name": "02-writing.md",
          "text": "## 2. Writing\n\n**A WRITE RULE** *(Product Owner; SRC-fixture-book, ch. 9)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n\n**A WRITER NAMES ITS FILE** *(SRC-fixture-book, ch. 8)*\nA writer names the file it wrote.\n*Check:* no automatic check; at review\n"
        }
      ],
      "notes": [],
      "conflictWritten": false
    }
  }
}
```
