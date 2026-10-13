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
