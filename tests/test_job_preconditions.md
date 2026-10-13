# Job Precondition Cases

## open use case blocks architecture drafting

The precondition is a product with two use cases. `UC-001` has an approval record for its current text; `UC-002` has no
approval record and is open. The attempted run proves no prompt is sent after preparation reports the blocking finding.

### Case

```json
{
  "input": {
    "name": "open-use-case",
    "attemptRun": true,
    "productSpec": "# Fixture product - Specification\n\n## Section\n\n**A SAMPLE RULE** *(Product Owner)*\nA sample rule that a use case realises.\n*Check:* `tests/sample.test.mjs`\n",
    "useCases": [
      { "id": "UC-001", "title": "Read a file", "path": "docs/use-cases/UC-001-read-a-file.md" },
      { "id": "UC-002", "title": "Write a file", "path": "docs/use-cases/UC-002-write-a-file.md" }
    ],
    "accepted": ["UC-001"]
  },
  "expected": {
    "fits": true,
    "blocking": [
      {
        "artifact": "https://github.com/alice/product",
        "line": 1,
        "kind": "error",
        "rule": "ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES",
        "what": "use cases that are not accepted: UC-002 (is open)",
        "fix": "accept them first (UC-008)"
      }
    ],
    "partOrder": [
      { "recipe": "whole-spec", "name": "SPEC.md" },
      { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-001-read-a-file.md \u2014 accepted" },
      { "recipe": "chapters-for-architecture", "name": "chapters 9 to 12 fixture" }
    ],
    "acceptedUseCases": ["docs/use-cases/UC-001-read-a-file.md \u2014 accepted"],
    "runError": "NotStartable",
    "sent": 0
  }
}
```

## accepted use cases let architecture drafting start

The precondition is the same product, but both use cases have approval records naming their current text.

### Case

```json
{
  "input": {
    "name": "accepted-use-cases",
    "attemptRun": false,
    "productSpec": "# Fixture product - Specification\n\n## Section\n\n**A SAMPLE RULE** *(Product Owner)*\nA sample rule that a use case realises.\n*Check:* `tests/sample.test.mjs`\n",
    "useCases": [
      { "id": "UC-001", "title": "Read a file", "path": "docs/use-cases/UC-001-read-a-file.md" },
      { "id": "UC-002", "title": "Write a file", "path": "docs/use-cases/UC-002-write-a-file.md" }
    ],
    "accepted": ["UC-001", "UC-002"]
  },
  "expected": {
    "fits": true,
    "blocking": [],
    "partOrder": [
      { "recipe": "whole-spec", "name": "SPEC.md" },
      { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-001-read-a-file.md \u2014 accepted" },
      { "recipe": "accepted-use-cases", "name": "docs/use-cases/UC-002-write-a-file.md \u2014 accepted" },
      { "recipe": "chapters-for-architecture", "name": "chapters 9 to 12 fixture" }
    ],
    "acceptedUseCases": [
      "docs/use-cases/UC-001-read-a-file.md \u2014 accepted",
      "docs/use-cases/UC-002-write-a-file.md \u2014 accepted"
    ],
    "runError": null,
    "sent": null
  }
}
```
