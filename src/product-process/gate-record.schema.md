# The gate record

The schema of a gate record under `docs/gates/`, in MOD-documents' schema language. A record names the gate, the work
waiting there, its decider and deciding role, its decision, the checked artifact blobs or commit, and its date. Its
`## Reason` gives the decision's reasoning where there is one.

```json
{
  "schema": "gate-record",
  "shape": "document",
  "rule": "THE GATE IS RECORDED",
  "path": "docs/gates/{slug}.md",
  "frontMatter": {
    "gate": { "type": "text", "required": true },
    "job": { "type": "text" },
    "decider": { "type": "text", "required": true },
    "role": { "type": "text", "required": true },
    "decision": { "type": "enum", "values": ["passed", "rejected"], "required": true },
    "on": { "type": "list", "item": { "type": "text" }, "required": true, "nonEmpty": true },
    "date": { "type": "time", "required": true }
  },
  "sections": [
    { "heading": "## Reason", "required": false }
  ],
  "otherSections": "forbidden"
}
```
