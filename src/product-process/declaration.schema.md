# The declaration of a product's process

The schema of a product's declaration `docs/process.md` — how the product is developed —, in MOD-documents' schema
language: the format that MOD-product-process' file states under Data. A product declares exactly one process model, its
roles and their holders, its practices, its branches and its Definition of Done.

- `model` names the declared model by its `name`; `model_file` is the path of the model's file, in the instance under
  `docs/process-models/` or in the shipped catalogue under `src/model-catalogue/models/`; `model_version` is the commit of
  the instance that holds that file, the version the product keeps until its declaration is saved again. `sprint_close`
  names the participant who closes a sprint; without it, the Product Owner closes it.
- `## Roles` gives each role of the model its participants, by their names in the instance's `docs/participants.md`,
  separated by commas where the role takes several.
- `## Practices` lists the practices added to the model, one per line as `- <name>`, or `- none`.
- `## Branches` gives a phase of the model, or the sprint of a model that works in sprints, a branch of its own. Without a
  row, work merges into the default branch.
- `## Definition of Done` names the conditions added to the job rules, one per line — `review: <n> by participants other
  than the implementer`, `check: <CI check name>`, `gate: <gate>` —, or says in a sentence that the job rules hold and no
  condition is added.
- `## Gates added by requirements`, which a declaration may leave out, names each gate a process requirement adds: the
  requirement of the instance's SPEC that adds it, the two phases it stands between as `<phase> → <phase>`, the artifacts
  it checks, its condition and its decider.

Other sections are free text: the model in words, how sprints run, boundaries. The language has no type for the lines of
`## Practices` and `## Definition of Done`: the schema holds both sections as text.

```json
{
  "schema": "declaration",
  "shape": "document",
  "rule": "THE PROCESS MODEL IS DECLARED PER PRODUCT",
  "path": "docs/process.md",
  "frontMatter": {
    "model": { "type": "text", "required": true },
    "model_file": { "type": "path", "required": true },
    "model_version": { "type": "sha", "digits": 40, "required": true },
    "sprint_close": { "type": "text" }
  },
  "sections": [
    { "heading": "## Roles", "required": true, "table": { "columns": [
      { "name": "Role", "value": { "type": "text", "required": true } },
      { "name": "Participants", "value": { "type": "list", "item": { "type": "text" } } }
    ] } },
    { "heading": "## Practices", "required": true },
    { "heading": "## Branches", "required": true, "table": { "columns": [
      { "name": "Phase or time box", "value": { "type": "text", "required": true } },
      { "name": "Branch", "value": { "type": "text", "required": true } }
    ] } },
    { "heading": "## Definition of Done", "required": true },
    { "heading": "## Gates added by requirements", "required": false, "table": { "columns": [
      { "name": "Requirement", "value": { "type": "requirement", "required": true } },
      { "name": "Between", "value": { "type": "text", "required": true } },
      { "name": "Artifacts", "value": { "type": "text", "required": true } },
      { "name": "Condition", "value": { "type": "text", "required": true } },
      { "name": "Decider", "value": { "type": "text", "required": true } }
    ] } }
  ],
  "otherSections": "allowed"
}
```
