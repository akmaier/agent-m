# The register of an instance's participants

The schema of the register `docs/participants.md` of the instance repository, in MOD-documents' schema language: the
format that MOD-participant-list's file states under Data. The register is a title, a sentence on what it is, and one
table with one row per participant. The table stands under the title with no heading of its own, so the schema names
the title line as the heading of the table's section.

The schema states which column is required for which type: `Model` and `Processing place` for every type but `person`,
whose row has `—` in them. So a CLI agent's row without a model is an error, and a person's row without one is not.

What the language cannot say is written where it applies:

- `Name` is lower-case letters, digits and hyphens, unique in the register. The language has no type for that form and
  no rule across the rows of a table: the schema holds it as text.
- `Price` is written `<input> / <output> <currency> per million tokens`, and `Route` in the form its type asks for, such
  as `account <server>/<account>` for a person or `bridge <bridge> agent <claude, codex or opencode>` for a CLI agent. The
  language has no type for these forms: the schema holds both as text.

```json
{
  "schema": "participants",
  "shape": "document",
  "rule": "PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE",
  "path": "docs/participants.md",
  "sections": [
    { "heading": "# Participants of this instance", "required": true, "table": { "columns": [
      { "name": "Name", "value": { "type": "text", "required": true } },
      { "name": "Type", "value": { "type": "enum", "values": ["person", "model endpoint", "CI agent", "CLI agent",
        "sandboxed agent"], "required": true, "rule": "A PARTICIPANT HAS ONE OF FIVE TYPES" } },
      { "name": "Model", "value": { "type": "text", "requiredWhen": { "field": "Type", "notIn": ["person"],
        "rule": "A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL" } } },
      { "name": "Context", "value": { "type": "number" } },
      { "name": "Price", "value": { "type": "text" } },
      { "name": "Capabilities", "value": { "type": "list", "item": { "type": "enum", "values": ["draft text",
        "read the repository", "write to the repository", "run code and tests", "use tools", "reach the web"] },
        "required": true, "nonEmpty": true, "rule": "A PARTICIPANT DECLARES ITS CAPABILITIES" } },
      { "name": "Processing place", "value": { "type": "text", "requiredWhen": { "field": "Type", "notIn": ["person"],
        "rule": "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA" } } },
      { "name": "Route", "value": { "type": "text", "required": true } }
    ] } }
  ]
}
```
