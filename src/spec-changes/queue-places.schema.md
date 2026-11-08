# The places of an entry of a SPEC change queue

The schema of an entry's places file, `NN-<package>.plaetze.md` in a queue's folder, in MOD-documents' schema language: the format that
MOD-spec-changes' file states under Data. It holds the places in the requirement hierarchy of the requirements the entry adds, and only for an
entry that proposes at least one place; it is never part of the section's text. Its title line, `# Places — <heading>: entry NN`, `<heading>`
the section's heading without its number, changes from entry to entry and has no heading of its own, so the schema names its one section
`{ "underTitle": true }`; the places table stands under it.

What the language cannot say is written where it applies:

- Each row is one MOD-group-document `Place` of the requirement it names: `Group` its `group`, the titles from the top separated by ` / `,
  `—` for the top level; `New group` its `new`, `—` for none.
- A requirement the entry adds that no row names proposes no place.

```json
{
  "schema": "queue-places",
  "shape": "document",
  "rule": "AN ITEM HAS ONE PLACE IN ITS HIERARCHY",
  "path": "docs/spec-freigaben/{any}/{any}.plaetze.md",
  "sections": [
    { "underTitle": true, "required": true, "table": { "columns": [
      { "name": "Requirement", "value": { "type": "text", "required": true } },
      { "name": "Group", "value": { "type": "text" } },
      { "name": "New group", "value": { "type": "text" } }
    ] } }
  ]
}
```
