# The schema of a sprint record

The schema of `docs/backlog/sprints/<nn>.md`, in MOD-documents' schema language: the format MOD-work-plans' file states
under Data — its front matter records the sprint and its selection; the sections appended while it runs remain freeform
evidence and are never rewritten.

```json
{
  "schema": "sprint",
  "shape": "document",
  "rule": "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY",
  "path": "docs/backlog/sprints/{any}.md",
  "frontMatter": {
    "sprint": { "type": "number", "required": true },
    "goal": { "type": "text", "required": true },
    "start": { "type": "date", "required": true },
    "end": { "type": "date", "required": false },
    "closer": { "type": "text", "required": true },
    "branch": { "type": "text", "required": false },
    "selection": { "type": "list", "item": { "type": "identifier", "of": ["ITM"] }, "required": true }
  },
  "appended": [
    { "heading": "## Selection", "repeat": true },
    { "heading": "## Ended", "repeat": false },
    { "heading": "## Review", "repeat": false },
    { "heading": "## Unfinished items", "repeat": false },
    { "heading": "## Retrospective", "repeat": false }
  ]
}
```
