# Prompted Source Cases

## the account, neither registered nor linked, enters drafted requirements

### Case

```json
{
  "instance": "alice/agent-m",
  "entries": [
    { "id": "SRC-bob", "title": "Bob", "kind": "person", "identifier": "github.com/bob" }
  ],
  "linked": ["SRC-bob"],
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
    "source": "github.com/alice",
    "sections": [
      {
        "anchor": "## One",
        "until": null,
        "text": "## One\n\n**A HELD RULE** *(Fixture Source; github.com/alice, prompt)*\nChanged rule.\n*Check:* no automatic check; at review\n\n**A NEW PROMPTED RULE** *(github.com/alice, prompt)*\nNew rule.\n*Check:* no automatic check; at review\n",
        "places": []
      }
    ],
    "findings": []
  }
}
```

## counter-proof: a drafted requirement that does not name the account fails

### Case

```json
{
  "instance": "alice/agent-m",
  "dropAccount": true,
  "entries": [
    { "id": "SRC-bob", "title": "Bob", "kind": "person", "identifier": "github.com/bob" }
  ],
  "linked": ["SRC-bob"],
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
    "source": "github.com/alice",
    "sections": [],
    "findings": ["A REQUIREMENT HAS A REGISTERED SOURCE", "A REQUIREMENT HAS A REGISTERED SOURCE"]
  }
}
```
