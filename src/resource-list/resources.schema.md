# The resource list

The schema of the list `docs/resources.md` of a product, and of the instance, in MOD-documents' schema language: the format that
MOD-resource-list's file states under Data. The list is a title, a sentence on what it is, and one table with one row per resource. The
table stands under the title with no heading of its own and the title changes from list to list, so the schema names the text under the
title as its section.

The schema states the form of each column's value, and the full 40-digit commit a repository's `Pin` is. The columns a kind requires are stated once, in
`rules.mjs` (`resourceFindings`): `Pin` for every kind but compute; `Licence` for a repository, data and a model; `Maintainer` for those and for an
agent; `Processing place` for compute, an endpoint and an agent; `Paid`, `yes` or `no`, for an endpoint and an agent. In a table, `—` is a value left out.

What the language cannot say is written in `rules.mjs` too: the columns a kind requires, the form of a compute route, the form of a secret, a
maintainer who is a single person, and an entry that carries a participant's capabilities or role.

A maintainer is a single person when the `Maintainer` column holds one account written `@<account>`, or one person written
`person <name>`: `rules.mjs` then gives a warning. An organisation, `unknown`, and several accounts (`@alice, @bob`) are not a single
person.

```json
{
  "schema": "resources",
  "shape": "document",
  "rule": "A PRODUCT DECLARES ITS RESOURCES",
  "path": "docs/resources.md",
  "sections": [
    { "underTitle": true, "required": true, "table": { "columns": [
      { "name": "Name", "value": { "type": "text", "required": true } },
      { "name": "Kind", "value": { "type": "enum", "values": ["repository", "data", "model", "compute", "endpoint", "agent"],
        "required": true, "rule": "THE RESOURCE KIND IS ONE OF A CLOSED SET" } },
      { "name": "Address", "value": { "type": "text", "required": true } },
      { "name": "Pin", "value": { "type": "text", "rule": "A RESOURCE IS PINNED TO AN EXACT STATE",
        "variants": [ { "when": { "field": "Kind", "in": ["repository"] }, "type": "sha", "digits": 40 } ] } },
      { "name": "Licence", "value": { "type": "text", "rule": "A RESOURCE DECLARES ITS LICENCE" } },
      { "name": "Maintainer", "value": { "type": "text", "rule": "A RESOURCE NAMES ITS MAINTAINER" } },
      { "name": "Route", "value": { "type": "text", "required": true } },
      { "name": "Processing place", "value": { "type": "text", "rule": "A RESOURCE DECLARES WHERE IT PROCESSES DATA" } },
      { "name": "Paid", "value": { "type": "enum", "values": ["yes", "no"], "rule": "COMMIT TESTS CALL NO PAID SERVICE" } },
      { "name": "Secret", "value": { "type": "text", "rule": "A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE" } }
    ] } }
  ]
}
```
