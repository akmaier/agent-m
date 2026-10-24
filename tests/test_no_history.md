# No History Cases

## current repository findings

kind: repository

### Expected Findings

```json
[]
```

## use case with planted history marks

kind: fixture
path: docs/use-cases/UC-999-history-fixture.md

### Text

```markdown
---
id: UC-999
title: History fixture
area: checks
actors:
  - Author
realises:
  - A DOCUMENT HOLDS NO HISTORY
---
# UC-999 History fixture

Last edited: 2026-10-13

## Actors

- Author

## Precondition

- A fixture exists.

## Main flow

1. The author reads it.

## Alternative flows

- withdrawn 2026-10-12.

## Postcondition

- PO decision 2026-10-11.
```

### Expected Findings

```json
[
  {
    "artifact": "UC-999",
    "line": 12,
    "kind": "error",
    "rule": "A DOCUMENT HOLDS NO HISTORY",
    "what": "the document holds a mark of history (edit-stamp): \"Last edited: 2026-10-13\"",
    "fix": "remove it; the version history keeps what was changed, when and by whom"
  },
  {
    "artifact": "UC-999",
    "line": 28,
    "kind": "error",
    "rule": "A DOCUMENT HOLDS NO HISTORY",
    "what": "the document holds a mark of history (withdrawal): \"withdrawn 2026-10-12\"",
    "fix": "remove it; the version history keeps what was changed, when and by whom"
  },
  {
    "artifact": "UC-999",
    "line": 32,
    "kind": "error",
    "rule": "A DOCUMENT HOLDS NO HISTORY",
    "what": "the document holds a mark of history (dated-change): \"2026-10-11\"",
    "fix": "remove it; the version history keeps what was changed, when and by whom"
  }
]
```

## SPEC with planted history mark

kind: fixture
path: SPEC.md

### Text

```markdown
# Fixture - Specification

## One

**A MARKED REQUIREMENT** *(PO decision 2026-10-13)*
The rule holds now.
*Check:* no automatic check; at review
```

### Expected Findings

```json
[
  {
    "artifact": "A MARKED REQUIREMENT",
    "line": 5,
    "kind": "error",
    "rule": "A DOCUMENT HOLDS NO HISTORY",
    "what": "the source holds a mark of history (dated-change): \"2026-10-13\"",
    "fix": "remove it; the version history keeps what was changed, when and by whom"
  }
]
```

## records and measurements are outside this rule

kind: excluded

### Files

```json
{
  "docs/gates/20261013-1200-development-release-testing-fixture.md": "Changed: 2026-10-13\n\n## Decision\n\nAccepted 2026-10-13.\n",
  "docs/measurements/2026-10-13-fixture.md": "PO decision 2026-10-13: the measurement was read on 2026-10-13.\n"
}
```

### Expected Findings

```json
[]
```
