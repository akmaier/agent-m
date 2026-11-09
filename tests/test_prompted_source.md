# Prompted Source Cases

## the account, neither registered nor linked, enters the drafted requirements

### Case

```json
{
  "instance": "alice/agent-m",
  "entries": [
    { "id": "SRC-bob", "title": "Bob", "kind": "person", "identifier": "github.com/bob" }
  ],
  "linked": ["SRC-bob"],
  "spec": "# Fixture product - Specification\n\n## One\n\n**A HELD RULE** *(Fixture Source)*\nOld rule.\n*Check:* no automatic check; at review\n",
  "sections": [
    "## One\n\n**A HELD RULE** *(Fixture Source; <account>)*\nChanged rule.\n*Check:* no automatic check; at review\n\n**A NEW PROMPTED RULE** *(<account>)*\nNew rule.\n*Check:* no automatic check; at review\n"
  ],
  "expected": {
    "source": "github.com/alice",
    "sections": [
      "## One\n\n**A HELD RULE** *(Fixture Source; github.com/alice)*\nChanged rule.\n*Check:* no automatic check; at review\n\n**A NEW PROMPTED RULE** *(github.com/alice)*\nNew rule.\n*Check:* no automatic check; at review\n"
    ],
    "form": [],
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
  "sections": [
    "## One\n\n**A HELD RULE** *(Fixture Source; <account>)*\nChanged rule.\n*Check:* no automatic check; at review\n\n**A NEW PROMPTED RULE** *(<account>)*\nNew rule.\n*Check:* no automatic check; at review\n"
  ],
  "expected": {
    "source": "github.com/alice",
    "sections": [
      "## One\n\n**A HELD RULE** *(Fixture Source; Unlinked Source)*\nChanged rule.\n*Check:* no automatic check; at review\n\n**A NEW PROMPTED RULE** *(Unlinked Source)*\nNew rule.\n*Check:* no automatic check; at review\n"
    ],
    "form": [["A HELD RULE", "THE PERSON WHO PROMPTS IS A SOURCE"], ["A NEW PROMPTED RULE", "THE PERSON WHO PROMPTS IS A SOURCE"]],
    "findings": ["A REQUIREMENT HAS A REGISTERED SOURCE", "A REQUIREMENT HAS A REGISTERED SOURCE"]
  }
}
```
