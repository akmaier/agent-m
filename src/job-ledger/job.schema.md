# The job record

The schema of a job's record `docs/jobs/JOB-<yyyymmdd>-<hhmm>-<4 hex>.md`, in MOD-documents' schema language: the format
that MOD-job-ledger's file (`docs/architecture/MOD-job-ledger.md`) states under Data. A record is evidence, written once
as its start and then only appended to, one section per event (`A RECORD IS EVIDENCE, NOT A PROPOSAL`); its body holds no
title line — the text after the front matter begins directly with `## Destinations`, as the module file's own worked
example shows.

- `## Destinations` and `## Parameters` name no `fields`/`table`: MOD-documents reads their raw text, and MOD-job-ledger
  parses it itself — the destinations as the bullet list the module file's example shows, the parameters as the one
  fenced `json` block.
- Every appended section carries `at:`, the time of that event, besides its own lines. A line the Data table writes with
  a space — `gate record:`, `works on:`, `jobs at once:` — is a field of that form here too: words of a front matter
  key's form separated by single spaces, which MOD-documents reads and appends as written (ITM-252). A front matter key
  itself stays as MOD-text-tools states it — no space — and so `works_on` of the front matter keeps its underscore.
- `## Gate reached` names `gate` and `decider` for a named gate, or `question` alone for a question to the author — the
  Data table's two forms of the same heading (ITM-252's Outcome). All three are optional fields of this schema; which of
  them a given record carries is MOD-job-ledger's to read, not this schema's to enforce — `documentFindings` does not
  check a section's fields yet (MOD-documents, checks.mjs).
- `## End`'s `usage:` and `cost:` hold the `Usage` and `Cost` values as one line of JSON each, for a value no scalar type
  of this language expresses (the Data table fixes no other form for them). Its round record (`roundsText`,
  MOD-job-runner, `rounds.schema.md`) is a later item's concern — no item has built it and no job has written one yet —
  and is left out of this schema's fields. A job's kind handing back a draft (`draft:`, one fenced `json` block) is, like
  `## Parameters`, not a field this schema names: MOD-job-ledger reads the block from the section's raw text itself, the
  same way it reads `## Parameters` (ITM-252's Outcome).

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
      "gate record": { "type": "path", "required": true }
    } },
    { "heading": "## Job started", "repeat": true, "fields": {
      "at": { "type": "time", "required": true },
      "job": { "type": "identifier", "of": ["JOB"], "required": true },
      "kind": { "type": "text", "required": true },
      "works on": { "type": "list", "required": true, "nonEmpty": true, "item": { "type": "either", "of": [
        "requirement", { "type": "identifier", "of": ["UC", "ARC", "MOD", "ITM", "SRC"] }, "url", { "type": "sha", "digits": 40 }
      ] } }
    } },
    { "heading": "## Limits raised", "repeat": true, "fields": {
      "at": { "type": "time", "required": true },
      "by": { "type": "text", "required": true },
      "jobs at once": { "type": "number", "required": true },
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
