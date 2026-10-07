# The job record

The schema of a job's record `docs/jobs/JOB-<yyyymmdd>-<hhmm>-<4 hex>.md`, in MOD-documents' schema language: the format
that MOD-job-ledger's file states under Data. A record is evidence, written once as its start and then only appended to,
one section per event (`A RECORD IS EVIDENCE, NOT A PROPOSAL`); its body holds no title line — the text after the front
matter begins directly with `## Destinations`, as the module file's own example shows.

- `## Destinations` and `## Parameters` name no `fields`/`table`: MOD-documents reads their raw text, and MOD-job-ledger
  parses it — the destinations as the bullet list the module file's example shows, the parameters as the one fenced
  `json` block.
- Every appended section carries `at:`, the time of that event, besides its own lines. `## Gate reached` holds either
  `gate:`/`decider:` or `question:`, never both pairs at once — one heading, two shapes, as the module file's Data
  names them (no separate heading for a question). A line the table names with a space — `gate record:`,
  `jobs at once:`, `works on:` — is written with an underscore in its key (`gate_record`, `jobs_at_once`, `works_on`),
  the same convention the front matter's own `works_on` already uses.
- `## End`'s `draft:` is one fenced `json` block, as the module file's Data says. Its `usage:` and `cost:` hold the
  `Usage` and `Cost` values as one line of JSON each, for a value no scalar type of this language expresses; its round
  record is a later item's concern (`roundsText`, MOD-job-runner, not built yet) and is left out of this schema's fields.

```json
{
  "schema": "job",
  "shape": "document",
  "rule": "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY",
  "path": "docs/jobs/{id}.md",
  "identifier": { "field": "id", "kind": "JOB" },
  "frontMatter": {
    "id": { "type": "identifier", "of": ["JOB"], "required": true, "rule": "EVERY ARTIFACT HAS AN IDENTIFIER" },
    "kind": { "type": "text", "required": true },
    "works_on": { "type": "list", "required": true, "nonEmpty": true, "item": { "type": "either", "of": [
      "requirement", { "type": "identifier", "of": ["UC", "ARC", "MOD", "ITM", "SRC"] }, "url", { "type": "sha", "digits": 40 }
    ] } },
    "participant": { "type": "text", "required": false },
    "model": { "type": "text", "required": false },
    "route": { "type": "text", "required": true },
    "run": { "type": "identifier", "of": ["JOB"], "required": false },
    "retries": { "type": "identifier", "of": ["JOB"], "required": false },
    "started_by": { "type": "text", "required": true },
    "start": { "type": "time", "required": true },
    "agent_m": { "type": "text", "required": true },
    "inputs": { "type": "list", "required": false, "item": { "type": "text" } },
    "limit": { "type": "number", "required": true }
  },
  "sections": [
    { "heading": "## Destinations", "required": true },
    { "heading": "## Parameters", "required": true }
  ],
  "otherSections": "forbidden",
  "appended": [
    { "heading": "## Taken", "repeat": false, "fields": {
      "at": { "type": "time", "required": true },
      "by": { "type": "text", "required": true }
    } },
    { "heading": "## Gate reached", "repeat": true, "fields": {
      "at": { "type": "time", "required": true },
      "gate": { "type": "text", "required": false },
      "decider": { "type": "text", "required": false },
      "question": { "type": "text", "required": false }
    } },
    { "heading": "## Resumed", "repeat": true, "fields": {
      "at": { "type": "time", "required": true },
      "gate_record": { "type": "path", "required": true }
    } },
    { "heading": "## Job started", "repeat": true, "fields": {
      "at": { "type": "time", "required": true },
      "job": { "type": "identifier", "of": ["JOB"], "required": true },
      "kind": { "type": "text", "required": true },
      "works_on": { "type": "list", "required": true, "nonEmpty": true, "item": { "type": "either", "of": [
        "requirement", { "type": "identifier", "of": ["UC", "ARC", "MOD", "ITM", "SRC"] }, "url", { "type": "sha", "digits": 40 }
      ] } }
    } },
    { "heading": "## Limits raised", "repeat": true, "fields": {
      "at": { "type": "time", "required": true },
      "by": { "type": "text", "required": true },
      "jobs_at_once": { "type": "number", "required": true },
      "cost": { "type": "number", "required": false },
      "rounds": { "type": "number", "required": true }
    } },
    { "heading": "## End", "repeat": false, "fields": {
      "at": { "type": "time", "required": true },
      "state": { "type": "enum", "values": ["done", "failed", "cancelled"], "required": true },
      "results": { "type": "list", "required": false, "item": { "type": "text" } },
      "usage": { "type": "text", "required": false },
      "cost": { "type": "text", "required": false },
      "reason": { "type": "text", "required": false },
      "log": { "type": "text", "required": false }
    } }
  ]
}
```
