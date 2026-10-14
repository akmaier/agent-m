# Prompted Source Cases

## linked person source enters drafted requirements

### Case

```json
{
  "account": "github.com/alice",
  "entries": [
    { "id": "SRC-alice", "title": "Alice", "kind": "person", "identifier": "github.com/alice" },
    { "id": "SRC-bob", "title": "Bob", "kind": "person", "identifier": "github.com/bob" }
  ],
  "linked": ["SRC-alice"],
  "spec": "# Fixture product - Specification\n\n## One\n\n**A HELD RULE** *(Fixture Source)*\nOld rule.\n*Check:* no automatic check; at review\n",
  "candidates": [
    {
      "name": "A BETTER RULE",
      "rule": "Changed rule.",
      "check": "no automatic check; at review",
      "constrains": "product",
      "passage": "prompt",
      "class": "change",
      "of": "A HELD RULE"
    },
    {
      "name": "A NEW PROMPTED RULE",
      "rule": "New rule.",
      "check": "no automatic check; at review",
      "constrains": "product",
      "passage": "prompt",
      "class": "new",
      "of": "A HELD RULE"
    }
  ],
  "classes": [
    { "refs": ["A BETTER RULE"], "from": ["prompt"], "class": "change", "of": "A HELD RULE", "decidedBy": "participant" },
    { "refs": ["A NEW PROMPTED RULE"], "from": ["prompt"], "class": "new", "of": "A HELD RULE", "decidedBy": "participant" }
  ],
  "expected": {
    "source": "SRC-alice",
    "sections": [
      {
        "anchor": "## One",
        "until": null,
        "text": "## One\n\n**A HELD RULE** *(Fixture Source; SRC-alice, prompt)*\nChanged rule.\n*Check:* no automatic check; at review\n\n**A NEW PROMPTED RULE** *(SRC-alice, prompt)*\nNew rule.\n*Check:* no automatic check; at review\n"
      }
    ]
  }
}
```

## unlinked person source sends nothing

### Case

```json
{
  "account": "github.com/bob",
  "entries": [
    { "id": "SRC-alice", "title": "Alice", "kind": "person", "identifier": "github.com/alice" },
    { "id": "SRC-bob", "title": "Bob", "kind": "person", "identifier": "github.com/bob" }
  ],
  "linked": ["SRC-alice"],
  "spec": "# Fixture product - Specification\n\n## One\n\n**A HELD RULE** *(Fixture Source)*\nOld rule.\n*Check:* no automatic check; at review\n",
  "candidates": [
    {
      "name": "A NEW PROMPTED RULE",
      "rule": "New rule.",
      "check": "no automatic check; at review",
      "constrains": "product",
      "passage": "prompt",
      "class": "new",
      "of": "A HELD RULE"
    }
  ],
  "classes": [
    { "refs": ["A NEW PROMPTED RULE"], "from": ["prompt"], "class": "new", "of": "A HELD RULE", "decidedBy": "participant" }
  ],
  "expected": {
    "source": null,
    "sections": []
  }
}
```
