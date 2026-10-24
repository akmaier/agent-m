# Identifier Stability Cases

The cases of `tests/test_identifier_stability.py`, for **THE NAME IS THE ID AND IT SURVIVES**: "An identifier travels with its artifact when the artifact moves between sections or files, and a withdrawn identifier is never reused." Its check: "an identifier that the version history holds and the current files do not is never given to another artifact." The code under test is MOD-identifiers: `identifiersIn` reads the identifiers a text writes, `nextIdentifier` gives the identifier of a new artifact from every identifier the version history holds (`everUsed`).

**How a case reads.** `given` is its precondition. `input.check` is `travels` (the same text read at two places, `places`, each a path) or `next` (`nextIdentifier` for `kind`, with `everUsed` and, for a kind named by a slug, `slug`). `expected.ids` is the list of identifiers read at each place; `expected.next` the identifier given, or `expected.refused` the name of the error that refuses it.

## An identifier travels with its artifact

### A use case moved to another file keeps its identifier

```json
{
  "given": "The text of the use case UC-002, read from its file and from the file it was renamed to.",
  "input": {
    "check": "travels",
    "text": "---\nid: UC-002\ntitle: Show each status\nrealises:\n  - THE STATUS IS SHOWN\n---\n# UC-002 Show each status\n",
    "places": ["docs/use-cases/UC-002-show-the-status.md", "docs/use-cases/UC-002-show-each-status.md"]
  },
  "expected": {
    "ids": [["UC-002", "THE STATUS IS SHOWN", "UC-002"], ["UC-002", "THE STATUS IS SHOWN", "UC-002"]]
  }
}
```

### A requirement moved to another section keeps its name

```json
{
  "given": "The head of a requirement, read in the SPEC before and after it moved from section 1 to section 2.",
  "input": {
    "check": "travels",
    "text": "**THE STATUS IS SHOWN** *(PO A. Maier)*\nThe status of every file is shown.\n*Check:* `tests/test_status.py`\n",
    "places": ["SPEC.md", "SPEC.md"]
  },
  "expected": {
    "ids": [["THE STATUS IS SHOWN"], ["THE STATUS IS SHOWN"]]
  }
}
```

## A withdrawn identifier is never reused

### A use case after a withdrawn one gets the next number, not the withdrawn one

```json
{
  "given": "The version history holds UC-001, UC-030 and UC-031; UC-031 was withdrawn, and no current file holds it.",
  "input": {
    "check": "next",
    "kind": "UC",
    "everUsed": ["UC-001", "UC-030", "UC-031"]
  },
  "expected": {
    "next": "UC-032"
  }
}
```

### A module's identifier that the history holds is refused

```json
{
  "given": "The version history holds MOD-page, a module that was withdrawn; a new module is to be named page.",
  "input": {
    "check": "next",
    "kind": "MOD",
    "everUsed": ["MOD-page", "MOD-view"],
    "slug": "page"
  },
  "expected": {
    "refused": "IdentifierTaken"
  }
}
```

## THE NAME IS THE ID AND IT SURVIVES: counter-proofs

### Counter-proof: with the withdrawn use case left out of the history, its number would be given again

```json
{
  "given": "The same history without UC-031, as the current files alone would give it.",
  "input": {
    "check": "next",
    "kind": "UC",
    "everUsed": ["UC-001", "UC-030"]
  },
  "expected": {
    "next": "UC-031"
  }
}
```

### Counter-proof: a slug the history does not hold is given

```json
{
  "given": "The version history holds MOD-view only; a new module is to be named page.",
  "input": {
    "check": "next",
    "kind": "MOD",
    "everUsed": ["MOD-view"],
    "slug": "page"
  },
  "expected": {
    "next": "MOD-page"
  }
}
```
