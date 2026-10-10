# The role assignment of a product

The schema of a product's role assignment `docs/role-assignments/<name>.md` — who fills which role of the product's
process —, in MOD-documents' schema language: the format that MOD-product-process' file states under Data. In a model
that works in sprints, `<name>` is the team.

- `## Roles` gives each role of the product's model its participants, by their names in the instance's
  `docs/participants.md`, separated by commas: one for a role that one participant fills, one or more for a role that
  several may fill.

Nothing else stands in it: no front matter, no other section, and, besides the file's title, no text but the table of
`## Roles`. What the language cannot say — a role the product's process does not have, more participants than a role
takes, a name the instance's list does not hold, text besides the table — `roleAssignmentFindings` decides.

```json
{
  "schema": "role-assignment",
  "shape": "document",
  "rule": "A ROLE ASSIGNMENT FILLS THE ROLES",
  "path": "docs/role-assignments/{slug}.md",
  "sections": [
    { "heading": "## Roles", "required": true, "table": { "columns": [
      { "name": "Role", "value": { "type": "text", "required": true } },
      { "name": "Participants", "value": { "type": "list", "item": { "type": "text" }, "required": true, "nonEmpty": true } }
    ] } }
  ],
  "otherSections": "forbidden"
}
```
