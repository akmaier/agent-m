# The test schedule

The schema of a product's declared test schedule `docs/tests/schedule.md`, in MOD-documents' schema language: the
format that MOD-test-schedule's file (`docs/architecture/MOD-test-schedule.md`) states under Data
(`THE TEST SCHEDULE IS DECLARED PER PRODUCT`). One file per product, at a fixed path; its body holds no title line —
the text after the front matter begins directly with `## Levels`, as a job's record begins directly with
`## Destinations` (`job.schema.md`).

- `nightly` is the time of the nightly run, `HH:MM` in UTC: a time of day with no date, a form the language has no
  type for, so the schema holds it as text — as `participants.schema.md` holds a form the language has none for.
- `command` is the command that runs the test files a job is given, left out where the product's tests run with node's
  own test runner. `setup` is a command run in every test job before its tests, left out where nothing is installed;
  `cache` the paths `setup` fills that the CI service keeps between runs, one per line, left out where nothing is kept —
  paths on the runner, not in the repository, so held as text; `minutes` the time limit of every job on every commit and
  on a pull request, a whole number of minutes, left out where none is set.
  `scheduleFindings` names a `minutes` that is not a whole number from 1.
- `## Levels` names one row for each of the five levels of `EVERY TEST HAS ONE LEVEL`, and a sixth, `paid`, for a test
  that calls a paid service or a model, which cuts across them. A cell of its five occasion columns is `✓` or left
  out. `runs on` is `hosted` or the name of a participant of the instance with *run code and tests* whose route is a
  self-hosted runner, left out where the row names none. `shards` is the number of parallel jobs the row's tests are
  split across, a whole number from 1, empty for 1; a table may leave the column out, and every row then has one shard.
  `scheduleFindings` names a `shards` that is not a whole number from 1.

```json
{
  "schema": "schedule",
  "shape": "document",
  "rule": "THE TEST SCHEDULE IS DECLARED PER PRODUCT",
  "path": "docs/tests/schedule.md",
  "frontMatter": {
    "nightly": { "type": "text", "required": true },
    "command": { "type": "text", "required": false },
    "setup": { "type": "text", "required": false },
    "cache": { "type": "list", "item": { "type": "text" }, "required": false },
    "minutes": { "type": "number", "required": false }
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
        { "name": "runs on", "value": { "type": "text", "required": false } },
        { "name": "shards", "value": { "type": "number", "required": false }, "optional": true }
      ]
    } }
  ],
  "otherSections": "forbidden"
}
```
