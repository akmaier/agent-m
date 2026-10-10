# The use-case schema

A use case, `docs/use-cases/UC-<nnn>-<slug>.md`, in MOD-documents' schema language, as
docs/architecture/MOD-documents.md states it under Data: its front matter, its title, its five sections — each required —,
other sections allowed, a diagram required.

```json
{
  "schema": "use-case",
  "shape": "document",
  "rule": "ONE USE CASE, ONE FILE",
  "path": "docs/use-cases/UC-{nnn}-{slug}.md",
  "identifier": {
    "field": "id",
    "kind": "UC"
  },
  "frontMatter": {
    "id": {
      "type": "identifier",
      "of": [
        "UC"
      ],
      "required": true,
      "rule": "EVERY ARTIFACT HAS AN IDENTIFIER"
    },
    "title": {
      "type": "text",
      "required": true
    },
    "area": {
      "type": "text",
      "required": true
    },
    "actors": {
      "type": "list",
      "item": {
        "type": "text"
      },
      "required": true,
      "nonEmpty": true,
      "rule": "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"
    },
    "realises": {
      "type": "list",
      "item": {
        "type": "requirement"
      },
      "required": true,
      "rule": "A USE CASE REALISES NAMED REQUIREMENTS"
    }
  },
  "title": "# {id} {title}",
  "sections": [
    {
      "heading": "## Actors",
      "required": true,
      "rule": "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"
    },
    {
      "heading": "## Precondition",
      "required": true,
      "rule": "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"
    },
    {
      "heading": "## Main flow",
      "required": true,
      "rule": "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"
    },
    {
      "heading": "## Alternative flows",
      "required": true,
      "rule": "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"
    },
    {
      "heading": "## Postcondition",
      "required": true,
      "rule": "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"
    }
  ],
  "otherSections": "allowed",
  "diagrams": "required",
  "noHistory": true,
  "key": [
    "title"
  ]
}
```
