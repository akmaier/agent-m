# The schema of a practice

The schema of a practice the catalogue ships, under `src/model-catalogue/practices/`, in MOD-documents' schema language:
the format that MOD-model-catalogue's file states under Data. A practice is added to a declared model and never chosen
instead of one: it names the models it fits, what it adds to them, and what it is.

- `fits` names the models the practice can be added to, by their `name`.
- `## Adds` says what the practice adds — phases, gates, roles or artifacts —, as its chapter of the book states it.
- `## What it is` explains the practice for someone new to it, and names its chapter of the book.

```json
{
  "schema": "practice",
  "shape": "document",
  "rule": "A PRACTICE IS NOT A MODEL",
  "path": "src/model-catalogue/practices/{slug}.md",
  "frontMatter": {
    "name": { "type": "text", "required": true },
    "fits": { "type": "list", "item": { "type": "text" }, "required": true, "nonEmpty": true }
  },
  "sections": [
    { "heading": "## Adds", "required": true },
    { "heading": "## What it is", "required": true }
  ]
}
```
