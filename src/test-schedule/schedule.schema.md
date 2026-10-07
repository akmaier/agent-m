# The test schedule

The schema of a product's declared test schedule `docs/tests/schedule.md`, in MOD-documents' schema language: the
format that MOD-test-schedule's file (`docs/architecture/MOD-test-schedule.md`) states under Data
(`THE TEST SCHEDULE IS DECLARED PER PRODUCT`). One file per product, at a fixed path; its body holds no title line —
the text after the front matter begins directly with `## Levels`, as a job's record begins directly with
`## Destinations` (`job.schema.md`).

- `nightly` is the time of the nightly run, `HH:MM` in UTC: a time of day with no date, a form the language has no
  type for, so the schema holds it as text — as `participants.schema.md` holds a form the language has none for.
- `command` and `report` are each left out where they do not apply: `command` where the product's tests run with
  node's own test runner, `report` where that runner's own JUnit reporter is the one the generated configuration sets
  itself.
- `## Levels` names one row for each of the five levels of `EVERY TEST HAS ONE LEVEL`, and a sixth, `paid`, for a test
  that calls a paid service or a model, which cuts across them. A cell of its five occasion columns is `✓` or left
  out. `runs on` is `hosted` or the name of a participant of the instance with *run code and tests* whose route is a
  self-hosted runner, left out where the row names none.

```json
{
  "schema": "schedule",
  "shape": "document",
  "rule": "THE TEST SCHEDULE IS DECLARED PER PRODUCT",
  "path": "docs/tests/schedule.md",
  "frontMatter": {
    "nightly": { "type": "text", "required": true },
    "command": { "type": "text", "required": false },
    "report": { "type": "path", "required": false }
  },
  "sections": [
    { "heading": "## Levels", "required": true, "table": {
      "columns": [
        { "name": "Row", "value": { "type": "enum",
          "values": ["unit", "component", "system", "paid", "release", "user"], "required": true } },
        { "name": "every commit", "value": { "type": "enum", "values": ["✓"], "required": false } },
        { "name": "pull request", "value": { "type": "enum", "values": ["✓"], "required": false } },
        { "name": "nightly", "value": { "type": "enum", "values": ["✓"], "required": false } },
        { "name": "release candidate", "value": { "type": "enum", "values": ["✓"], "required": false } },
        { "name": "on demand", "value": { "type": "enum", "values": ["✓"], "required": false } },
        { "name": "runs on", "value": { "type": "text", "required": false } }
      ]
    } }
  ],
  "otherSections": "forbidden"
}
```
