# Derivation Context Cases

All cases use the same fixture product: the SPEC holds two requirements in its Reading section, and one open queue
proposes a changed `A SAMPLE RULE` plus a new `A QUEUED RULE`.

## derive requirements receives the SPEC and open queues

The precondition is that `derive-requirements` is prepared with a fitting drafter. Its non-target source excerpt and
chapter parts are small stand-ins; the `spec-with-queues` part is MOD-spec-changes' real recipe.

### Case

```json
{
  "input": {
    "case": "prepare",
    "kind": "derive-requirements",
    "params": { "source": "SRC-fixture-book" },
    "productSpec": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**ANOTHER SAMPLE RULE** *(Product Owner)*\nA reader sees the name of a file.\n*Check:* no automatic check; at review\n",
    "openQueueProposal": "## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole, or says why not.\n*Check:* `tests/sample.test.mjs`\n\n**A QUEUED RULE** *(Product Owner)*\nA queued rule is visible.\n*Check:* no automatic check; at review\n"
  },
  "expected": {
    "fits": true,
    "blocking": [],
    "leftOut": [],
    "partOrder": [
      { "recipe": "source-excerpt", "name": "SRC-fixture-book excerpt" },
      { "recipe": "spec-with-queues", "name": "SPEC.md with its open queues" },
      { "recipe": "chapters-for-requirements", "name": "chapter 8 fixture" }
    ],
    "context": {
      "name": "SPEC.md with its open queues",
      "artifacts": ["A SAMPLE RULE", "ANOTHER SAMPLE RULE", "A SAMPLE RULE", "A QUEUED RULE"],
      "blocks": [
        { "name": "A SAMPLE RULE", "state": "in SPEC", "section": "## 1. Reading" },
        { "name": "ANOTHER SAMPLE RULE", "state": "in SPEC", "section": "## 1. Reading" },
        { "name": "A SAMPLE RULE", "state": "open", "section": "## 1. Reading" },
        { "name": "A QUEUED RULE", "state": "open", "section": "## 1. Reading" }
      ]
    },
    "namedRequirementText": null,
    "notFitting": []
  }
}
```

## change requirements receives the named section and derivation context

The precondition is that `change-requirements` is prepared with an instruction and a named existing requirement. The
named requirement part must hold the whole section, while `spec-with-queues` still holds the SPEC and open queue
requirements for classification.

### Case

```json
{
  "input": {
    "case": "prepare",
    "kind": "change-requirements",
    "params": {
      "requirements": ["A SAMPLE RULE"],
      "source": "SRC-alice",
      "instruction": "Make the reader say why the file cannot be read."
    },
    "productSpec": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**ANOTHER SAMPLE RULE** *(Product Owner)*\nA reader sees the name of a file.\n*Check:* no automatic check; at review\n",
    "openQueueProposal": "## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole, or says why not.\n*Check:* `tests/sample.test.mjs`\n\n**A QUEUED RULE** *(Product Owner)*\nA queued rule is visible.\n*Check:* no automatic check; at review\n"
  },
  "expected": {
    "fits": true,
    "blocking": [],
    "leftOut": [],
    "partOrder": [
      { "recipe": "instruction", "name": "instruction" },
      { "recipe": "named-requirements", "name": "A SAMPLE RULE" },
      { "recipe": "spec-with-queues", "name": "SPEC.md with its open queues" },
      { "recipe": "chapters-for-requirements", "name": "chapter 8 fixture" }
    ],
    "context": {
      "name": "SPEC.md with its open queues",
      "artifacts": ["A SAMPLE RULE", "ANOTHER SAMPLE RULE", "A SAMPLE RULE", "A QUEUED RULE"],
      "blocks": [
        { "name": "A SAMPLE RULE", "state": "in SPEC", "section": "## 1. Reading" },
        { "name": "ANOTHER SAMPLE RULE", "state": "in SPEC", "section": "## 1. Reading" },
        { "name": "A SAMPLE RULE", "state": "open", "section": "## 1. Reading" },
        { "name": "A QUEUED RULE", "state": "open", "section": "## 1. Reading" }
      ]
    },
    "namedRequirementText": "## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**ANOTHER SAMPLE RULE** *(Product Owner)*\nA reader sees the name of a file.\n*Check:* no automatic check; at review\n",
    "notFitting": []
  }
}
```

## small participant is not sent a too-large derivation context

The precondition is the same derive-requirements fixture, but the chosen drafter has a context window smaller than the
prepared destination.

### Case

```json
{
  "input": {
    "case": "small-context",
    "kind": "derive-requirements",
    "params": { "source": "SRC-fixture-book" },
    "productSpec": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**ANOTHER SAMPLE RULE** *(Product Owner)*\nA reader sees the name of a file.\n*Check:* no automatic check; at review\n",
    "openQueueProposal": "## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole, or says why not.\n*Check:* `tests/sample.test.mjs`\n\n**A QUEUED RULE** *(Product Owner)*\nA queued rule is visible.\n*Check:* no automatic check; at review\n"
  },
  "expected": {
    "small": {
      "fits": false,
      "blocking": [],
      "leftOut": [],
      "partOrder": [
        { "recipe": "source-excerpt", "name": "SRC-fixture-book excerpt" },
        { "recipe": "spec-with-queues", "name": "SPEC.md with its open queues" },
        { "recipe": "chapters-for-requirements", "name": "chapter 8 fixture" }
      ],
      "context": {
        "name": "SPEC.md with its open queues",
        "artifacts": ["A SAMPLE RULE", "ANOTHER SAMPLE RULE", "A SAMPLE RULE", "A QUEUED RULE"],
        "blocks": [
          { "name": "A SAMPLE RULE", "state": "in SPEC", "section": "## 1. Reading" },
          { "name": "ANOTHER SAMPLE RULE", "state": "in SPEC", "section": "## 1. Reading" },
          { "name": "A SAMPLE RULE", "state": "open", "section": "## 1. Reading" },
          { "name": "A QUEUED RULE", "state": "open", "section": "## 1. Reading" }
        ]
      },
      "namedRequirementText": null,
      "notFitting": [
        { "participant": "small-d", "context": 10, "sizeGreaterThanContext": true }
      ],
      "runError": "NotStartable",
      "sent": 0
    },
    "sameContextRequirements": true
  }
}
```

## architecture derivation receives the whole project and draft

The precondition is a first architecture derivation: the fixture product has two requirements, two use cases, approval
records for both use cases and no selection parameters. The fixture drafter returns a complete first draft; the fixture
reviewer returns no findings.

### Case

```json
{
  "input": {
    "name": "whole-project",
    "case": "architecture-prepare",
    "kind": "derive-architecture",
    "reviewers": true,
    "params": {},
    "productSpec": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
    "useCases": [
      { "id": "UC-001", "title": "Read a file", "path": "docs/use-cases/UC-001-read-a-file.md" },
      { "id": "UC-002", "title": "Write a file", "path": "docs/use-cases/UC-002-write-a-file.md" }
    ],
    "accepted": ["UC-001", "UC-002"],
    "draftFiles": [
      {
        "path": "docs/architecture/ARC-001-whole-file-flow.md",
        "text": "---\nid: ARC-001\ntitle: Whole file flow\nforced_by:\n  - A SAMPLE RULE\n  - A SECOND RULE\n  - UC-001\n  - UC-002\ndesigns:\n  - MOD-reader\n  - MOD-writer\n---\n# ARC-001 Whole file flow\n\n## Context\n\nFiles are read and written through two modules.\n\n## Decision\n\nUse reader and writer modules under one root decision.\n\n## Alternatives\n\nKeep one module.\n\n## Consequences\n\nThe file flow remains explicit.\n",
        "class": "new"
      },
      {
        "path": "docs/architecture/MOD-reader.md",
        "text": "---\nid: MOD-reader\ntitle: Reader\nfolder: src/reader/\nrealises:\n  - A SAMPLE RULE\n  - UC-001\nfollows:\n  - ARC-001\nuses: []\nprovides:\n  - readFile\n---\n# MOD-reader Reader\n\n## Responsibility\n\nRead files.\n\n## Parts\n\nOne reader service.\n\n## Data\n\nPath and content.\n\n## Interfaces\n\n- `readFile(path) -> string` — returns the text.\n\n## Files\n\nsrc/reader/index.mjs\n\n## Uses\n\nNone.\n",
        "class": "new"
      },
      {
        "path": "docs/architecture/MOD-writer.md",
        "text": "---\nid: MOD-writer\ntitle: Writer\nfolder: src/writer/\nrealises:\n  - A SECOND RULE\n  - UC-002\nfollows:\n  - ARC-001\nuses: []\nprovides:\n  - writeFile\n---\n# MOD-writer Writer\n\n## Responsibility\n\nWrite files.\n\n## Parts\n\nOne writer service.\n\n## Data\n\nPath and content.\n\n## Interfaces\n\n- `writeFile(path, text) -> void` — stores the text.\n\n## Files\n\nsrc/writer/index.mjs\n\n## Uses\n\nNone.\n",
        "class": "new"
      }
    ]
  },
  "expected": {
    "fits": true,
    "blocking": [],
    "leftOut": [],
    "params": {},
    "partOrder": [
      { "recipe": "whole-spec", "name": "SPEC.md" },
      { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-001-read-a-file.md \u2014 accepted" },
      { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-002-write-a-file.md \u2014 accepted" },
      { "recipe": "chapters-for-architecture", "name": "chapters 9 to 12 fixture" }
    ],
    "wholeSpecText": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
    "acceptedUseCases": [
      "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
      "docs/use-cases/UC-002-write-a-file.md \u2014 accepted"
    ],
    "destinations": [
      {
        "role": "drafter",
        "participant": "drafter-a",
        "parts": [
          "SPEC.md",
          "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
          "docs/use-cases/UC-002-write-a-file.md \u2014 accepted",
          "chapters 9 to 12 fixture"
        ]
      },
      {
        "role": "reviewer",
        "participant": "reviewer-b",
        "parts": [
          "SPEC.md",
          "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
          "docs/use-cases/UC-002-write-a-file.md \u2014 accepted",
          "chapters 9 to 12 fixture"
        ]
      }
    ],
    "notFitting": [],
    "runError": null,
    "stoppedBecause": "passed",
    "remaining": [],
    "sent": { "drafter": 1, "reviewer": 1 },
    "drafterInput": {
      "partOrder": [
        { "recipe": "whole-spec", "name": "SPEC.md" },
        { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-001-read-a-file.md \u2014 accepted" },
        { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-002-write-a-file.md \u2014 accepted" },
        { "recipe": "chapters-for-architecture", "name": "chapters 9 to 12 fixture" }
      ],
      "wholeSpecText": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
      "acceptedUseCases": [
        "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
        "docs/use-cases/UC-002-write-a-file.md \u2014 accepted"
      ],
      "draftFiles": []
    },
    "reviewerInput": {
      "partOrder": [
        { "recipe": "whole-spec", "name": "SPEC.md" },
        { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-001-read-a-file.md \u2014 accepted" },
        { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-002-write-a-file.md \u2014 accepted" },
        { "recipe": "chapters-for-architecture", "name": "chapters 9 to 12 fixture" },
        { "recipe": "draft", "name": "draft" }
      ],
      "wholeSpecText": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
      "acceptedUseCases": [
        "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
        "docs/use-cases/UC-002-write-a-file.md \u2014 accepted"
      ],
      "draftFiles": [
        "docs/architecture/ARC-001-whole-file-flow.md",
        "docs/architecture/MOD-reader.md",
        "docs/architecture/MOD-writer.md"
      ]
    }
  }
}
```

## architecture derivation of an open part is refused

The precondition is the same product, but only `UC-001` has an approval record. The attempted run proves a derivation
of only the accepted part is refused before any prompt is sent.

### Case

```json
{
  "input": {
    "name": "open-use-case-refused",
    "case": "architecture-prepare",
    "kind": "derive-architecture",
    "reviewers": true,
    "attemptRun": true,
    "params": {},
    "productSpec": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
    "useCases": [
      { "id": "UC-001", "title": "Read a file", "path": "docs/use-cases/UC-001-read-a-file.md" },
      { "id": "UC-002", "title": "Write a file", "path": "docs/use-cases/UC-002-write-a-file.md" }
    ],
    "accepted": ["UC-001"]
  },
  "expected": {
    "fits": true,
    "blocking": [
      ["error", "ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES"]
    ],
    "leftOut": [],
    "params": {},
    "partOrder": [
      { "recipe": "whole-spec", "name": "SPEC.md" },
      { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-001-read-a-file.md \u2014 accepted" },
      { "recipe": "chapters-for-architecture", "name": "chapters 9 to 12 fixture" }
    ],
    "wholeSpecText": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
    "acceptedUseCases": ["docs/use-cases/UC-001-read-a-file.md \u2014 accepted"],
    "destinations": [
      {
        "role": "drafter",
        "participant": "drafter-a",
        "parts": [
          "SPEC.md",
          "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
          "chapters 9 to 12 fixture"
        ]
      },
      {
        "role": "reviewer",
        "participant": "reviewer-b",
        "parts": [
          "SPEC.md",
          "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
          "chapters 9 to 12 fixture"
        ]
      }
    ],
    "notFitting": [],
    "runError": "NotStartable",
    "stoppedBecause": null,
    "remaining": null,
    "sent": { "drafter": 0, "reviewer": 0 },
    "drafterInput": null,
    "reviewerInput": null
  }
}
```

## small participant is not sent a too-large architecture context

The precondition is the first architecture derivation with both use cases accepted, but the chosen drafter has a context
window smaller than the prepared destination.

### Case

```json
{
  "input": {
    "case": "small-context",
    "kind": "derive-architecture",
    "params": {},
    "productSpec": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
    "useCases": [
      { "id": "UC-001", "title": "Read a file", "path": "docs/use-cases/UC-001-read-a-file.md" },
      { "id": "UC-002", "title": "Write a file", "path": "docs/use-cases/UC-002-write-a-file.md" }
    ],
    "accepted": ["UC-001", "UC-002"]
  },
  "expected": {
    "small": {
      "fits": false,
      "blocking": [],
      "leftOut": [],
      "params": {},
      "partOrder": [
        { "recipe": "whole-spec", "name": "SPEC.md" },
        { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-001-read-a-file.md \u2014 accepted" },
        { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-002-write-a-file.md \u2014 accepted" },
        { "recipe": "chapters-for-architecture", "name": "chapters 9 to 12 fixture" }
      ],
      "wholeSpecText": "# Fixture product - Specification\n\n## 1. Reading\n\n**A SAMPLE RULE** *(Product Owner)*\nA reader reads a file whole.\n*Check:* `tests/sample.test.mjs`\n\n**A SECOND RULE** *(Product Owner)*\nA writer writes a file whole.\n*Check:* no automatic check; at review\n",
      "acceptedUseCases": [
        "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
        "docs/use-cases/UC-002-write-a-file.md \u2014 accepted"
      ],
      "destinations": [
        {
          "role": "drafter",
          "participant": "small-d",
          "parts": [
            "SPEC.md",
            "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
            "docs/use-cases/UC-002-write-a-file.md \u2014 accepted",
            "chapters 9 to 12 fixture"
          ]
        }
      ],
      "notFitting": [
        { "participant": "small-d", "context": 10, "sizeGreaterThanContext": true }
      ],
      "runError": "NotStartable",
      "sent": 0
    },
    "sameContextParts": true
  }
}
```
