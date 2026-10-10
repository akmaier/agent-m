# The decision schema

An architecture decision, `docs/architecture/ARC-<nnn>-<slug>.md`, in MOD-documents' schema language: the
schema docs/architecture/MOD-documents.md states under Data, as it writes it.

```json
{ "schema": "decision", "shape": "document", "rule": "ONE ARCHITECTURE DECISION, ONE FILE",
  "path": "docs/architecture/ARC-{nnn}-{slug}.md",
  "identifier": { "field": "id", "kind": "ARC" },
  "frontMatter": {
    "id": { "type": "identifier", "of": ["ARC"], "required": true, "rule": "EVERY ARTIFACT HAS AN IDENTIFIER" },
    "title": { "type": "text", "required": true },
    "refines": { "type": "identifier", "of": ["ARC"], "required": false },
    "forced_by": { "type": "list", "item": { "type": "either", "of": ["requirement", { "type": "identifier", "of": ["UC"] }] }, "required": true, "nonEmpty": true, "rule": "EVERY ARTIFACT NAMES ITS ORIGIN" },
    "designs": { "type": "list", "item": { "type": "identifier", "of": ["MOD"] }, "required": false, "rule": "EVERY ARTIFACT NAMES ITS ORIGIN" } },
  "title": "# {id} {title}",
  "sections": [
    { "heading": "## Context", "required": true, "rule": "AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES" },
    { "heading": "## Decision", "required": true, "rule": "AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES" },
    { "heading": "## Alternatives", "required": true, "rule": "AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES" },
    { "heading": "## Due diligence", "required": false, "rule": "A REUSE DECISION RECORDS ITS DUE DILIGENCE" },
    { "heading": "## Consequences", "required": true, "rule": "AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES" } ],
  "otherSections": "forbidden", "diagrams": "allowed", "noHistory": true, "key": ["title"] }
```
