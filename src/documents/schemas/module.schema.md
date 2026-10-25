# The module schema

A module of the architecture, `docs/architecture/MOD-<slug>.md`, in MOD-documents' schema language: the schema
docs/architecture/MOD-documents.md states under Data, as it writes it.

```json
{ "schema": "module", "shape": "document", "rule": "ONE MODULE, ONE FILE",
  "path": "docs/architecture/MOD-{slug}.md",
  "identifier": { "field": "id", "kind": "MOD" },
  "frontMatter": {
    "id": { "type": "identifier", "of": ["MOD"], "required": true, "rule": "EVERY ARTIFACT HAS AN IDENTIFIER" },
    "title": { "type": "text", "required": true },
    "folder": { "type": "path", "required": true, "rule": "A MODULE IS A FOLDER" },
    "realises": { "type": "list", "item": { "type": "either", "of": ["requirement", { "type": "identifier", "of": ["UC"] }] }, "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    "follows": { "type": "list", "item": { "type": "identifier", "of": ["ARC"] }, "required": true, "nonEmpty": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    "uses": { "type": "list", "item": { "type": "interface" }, "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    "provides": { "type": "list", "item": { "type": "name" }, "required": true, "unique": true, "describedIn": "## Interfaces", "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" } },
  "title": "# {id} {title}",
  "sections": [
    { "heading": "## Responsibility", "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    { "heading": "## Parts", "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    { "heading": "## Data", "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    { "heading": "## Interfaces", "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    { "heading": "## Files", "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" },
    { "heading": "## Uses", "required": true, "rule": "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES" } ],
  "otherSections": "forbidden", "diagrams": "allowed", "noHistory": true, "key": ["id"] }
```
