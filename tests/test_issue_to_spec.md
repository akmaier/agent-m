# Issue To Specification Release Cases

The cases of `tests/test_issue_to_spec.py`, for the requirement `EVOLUTION ENTERS THROUGH THE SPECIFICATION`: an issue that changes behaviour becomes a
specification change first and a code change second.

**How a case reads.** `given` is its precondition. `input` holds the issues of the product `alice/product` (`issues`: the number and the labels of each),
the number of the page opened (`issue`), the person's steps in order (`class`: the click on a class of the issue; `draft`: the participant drafts the
change and the person saves it), and the candidates the fake participant answers (`candidates`). `expected` names only what the case asserts, out of:
`labels` and `state` (the issue at the end), `issueWrites` (the writes made to the issue), `committed` (every path committed to the product),
`outsideDocs` (those of them that do not lie under `docs/`, which are code or tests), `queueNames` (the issue each queue index names),
`queueHolds` (each of the case's `needles`: whether an entry of a queue holds it), `jobKinds` (the kind of each job record committed), and `changeSection` and `fixSection` (whether the page
offers the section that drafts the change and the one that fixes a bug).

## EVOLUTION ENTERS THROUGH THE SPECIFICATION - a change is written as a queue naming the issue

### The saved draft of a change is a queue naming the issue and holding the new requirement, not the conflict

```json
{
  "given": "The issue 7 of the product is labelled change. The product links the person's source. The participant answers a new requirement and a conflict; the person runs the draft and saves it.",
  "input": {
    "issues": [{ "number": 7, "labels": ["change"] }],
    "issue": 7,
    "needles": ["EVERY EXPORT KEEPS ALL PAGES", "THE EXPORT MAY DROP PAGES"],
    "steps": [{ "draft": true }],
    "candidates": [
      { "name": "EVERY EXPORT KEEPS ALL PAGES", "rule": "An export holds every page of the document.", "check": "tests/unit.test.mjs", "constrains": "product", "passage": "the export is cut off after the second page", "class": "new" },
      { "name": "THE EXPORT MAY DROP PAGES", "rule": "An export may drop pages.", "check": "tests/unit.test.mjs", "constrains": "product", "passage": "the export is cut off", "class": "conflict" }
    ]
  },
  "expected": {
    "queueNames": ["#7 of https://github.com/alice/product"],
    "queueHolds": { "EVERY EXPORT KEEPS ALL PAGES": true, "THE EXPORT MAY DROP PAGES": false },
    "outsideDocs": [],
    "jobKinds": ["change-requirements"],
    "state": "open",
    "fixSection": false
  }
}
```

## EVOLUTION ENTERS THROUGH THE SPECIFICATION - the code is not changed by a change

### An issue classed as a change by a click offers the draft of the change and no fix, and commits nothing

```json
{
  "given": "The issue 5 has no class. The person clicks Change.",
  "input": {
    "issues": [{ "number": 5, "labels": [] }],
    "issue": 5,
    "steps": [{ "class": "change" }],
    "candidates": []
  },
  "expected": {
    "labels": ["change"],
    "committed": [],
    "changeSection": true,
    "fixSection": false
  }
}
```

### A bug offers the fix and not the change - the known positive of the sections

```json
{
  "given": "The issue 6 is labelled defect.",
  "input": {
    "issues": [{ "number": 6, "labels": ["defect"] }],
    "issue": 6,
    "steps": [],
    "candidates": []
  },
  "expected": {
    "changeSection": false,
    "fixSection": true
  }
}
```
