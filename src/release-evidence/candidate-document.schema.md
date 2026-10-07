# The release candidate's test document

The schema of a release candidate's release test report `docs/tests/releases/v<version>.md`, in MOD-documents' schema
language: the format that MOD-release-evidence's file (`docs/architecture/MOD-release-evidence.md`) states under Data.
Its body holds no title line — it begins directly with `## Limitations`, as a product's schedule does
(`schedule.schema.md`).

- `version`, `candidate` (the tag `v<version>-rc.<N>`), `commit` (the tested commit) and `date` are the front matter.
- `## Limitations` is free text, first: every failing test and every rate worse than the last release's, one bullet
  each — `- <TST-<nnn> or rate name>: <the requirements it guards, comma separated>` —, empty when the run is green.
  It carries no reason yet: the reason is recorded later, in the approval record, at acceptance (`acceptAndRelease`).
- `## Levels` is a table, one row per level the complete run covered.
- `## Tests` is a table, one row per test: its level, its outcome (`passed`, `failed`, `not run`, `flaky`, or a
  model-dependent rate such as `6 of 10`) and the requirements it guards.
- `## Requirements` is a table, one row per requirement valid at the commit and the level of a test that guards it — or
  one row with no level and no test, for a requirement no test guards; `Outcome` is `passed` when every test of that
  row's level and requirement passed, `not run` when none ran, else `failed`.
- `## Changelog entry` is free text, the entry as it will stand in `CHANGELOG.md` — the one the person chose at
  *Start release candidate*.

```json
{
  "schema": "release-candidate-document",
  "shape": "document",
  "rule": "A RELEASE IS TAGGED AND LOGGED",
  "path": "docs/tests/releases/v{any}.md",
  "frontMatter": {
    "version": { "type": "text", "required": true },
    "candidate": { "type": "text", "required": true },
    "commit": { "type": "sha", "digits": 40, "required": true },
    "date": { "type": "date", "required": true }
  },
  "sections": [
    { "heading": "## Limitations", "required": true },
    { "heading": "## Levels", "required": true, "table": {
      "columns": [
        { "name": "Level", "value": { "type": "text", "required": true } },
        { "name": "Passed", "value": { "type": "number", "required": true } },
        { "name": "Failed", "value": { "type": "number", "required": true } },
        { "name": "Flaky", "value": { "type": "number", "required": true } },
        { "name": "Not run", "value": { "type": "number", "required": true } }
      ]
    } },
    { "heading": "## Tests", "required": true, "table": {
      "columns": [
        { "name": "Test", "value": { "type": "text", "required": true } },
        { "name": "Level", "value": { "type": "text", "required": true } },
        { "name": "Outcome", "value": { "type": "text", "required": true } },
        { "name": "Guards", "value": { "type": "list", "item": { "type": "text" }, "required": false } }
      ]
    } },
    { "heading": "## Requirements", "required": true, "table": {
      "columns": [
        { "name": "Requirement", "value": { "type": "text", "required": true } },
        { "name": "Level", "value": { "type": "text", "required": false } },
        { "name": "Tests", "value": { "type": "list", "item": { "type": "text" }, "required": false } },
        { "name": "Outcome", "value": { "type": "text", "required": true } }
      ]
    } },
    { "heading": "## Changelog entry", "required": true }
  ],
  "otherSections": "forbidden",
  "noHistory": true
}
```
