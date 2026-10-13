# The gate record

The schema of a gate record `docs/gates/<yyyymmdd>-<hhmm>-<gate slug>-<4 hex>.md` — the decision on one gate, written once —, in MOD-documents' schema
language: the format that MOD-product-process' file states under Data (`THE GATE IS RECORDED`, `A RECORD IS EVIDENCE, NOT A PROPOSAL`).

- The front matter holds `gate`, the gate as the workflow names it, `<phase> → <phase>` or the requirement that adds it; `job`, the job waiting there,
  left empty for a phase's gate; `decider`, a participant's name or `check: <CI check name>`; `role`, the deciding role; `decision`, `passed` or
  `rejected`; `on`, a list of what was checked, `<path>@<blob>` for each artifact, or the commit; and `date`.
- `## Reason` gives the reason: a rejection's, which `recordGateDecision` requires, or an agent's reasoning for either.
- The file's title and any other section are the writer's own.

What the language cannot say — that a rejection has its reason, that the decider held the role — is `recordGateDecision`'s and `mayDecide`'s, at the time of
the decision, and `gateStates` counts a record only when its role is the gate's decider.

```json
{
  "schema": "gate-record",
  "shape": "document",
  "rule": "THE GATE IS RECORDED",
  "path": "docs/gates/{slug}.md",
  "frontMatter": {
    "gate": { "type": "text", "required": true },
    "job": { "type": "text", "required": false },
    "decider": { "type": "text", "required": true },
    "role": { "type": "text", "required": true },
    "decision": { "type": "enum", "values": ["passed", "rejected"], "required": true },
    "on": { "type": "list", "required": true, "nonEmpty": true, "item": { "type": "text" } },
    "date": { "type": "text", "required": true }
  },
  "sections": [
    { "heading": "## Reason", "required": false }
  ],
  "otherSections": "allowed"
}
```
