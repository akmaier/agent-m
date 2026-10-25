# The item schema

A step of the implementation plan, `docs/plan/ITM-<nnn>-<slug>.md`, and an item of the backlog,
`docs/backlog/ITM-<nnn>-<slug>.md`, alike, in MOD-documents' schema language, as docs/architecture/MOD-documents.md states
it under Data. Each path names its own rule. A requirement the SPEC states for one kind of item only is named through a
variant whose condition is that kind's path: `realises` and `modules` for a file under `docs/backlog/`, `level` and
`tests` for a file under `docs/plan/`; for the other kind they name its path's rule. `built_by`, optional, names the
commits that built an item no merged pull request names. Other sections are allowed.

```json
{
  "schema": "item",
  "shape": "document",
  "rule": "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY",
  "path": [
    {
      "pattern": "docs/plan/ITM-{nnn}-{slug}.md",
      "rule": "THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY"
    },
    {
      "pattern": "docs/backlog/ITM-{nnn}-{slug}.md",
      "rule": "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY"
    }
  ],
  "identifier": {
    "field": "id",
    "kind": "ITM"
  },
  "frontMatter": {
    "id": {
      "type": "identifier",
      "of": [
        "ITM"
      ],
      "required": true,
      "rule": "EVERY ARTIFACT HAS AN IDENTIFIER"
    },
    "title": {
      "type": "text",
      "required": true
    },
    "level": {
      "type": "enum",
      "values": [
        "module",
        "subsystem",
        "system"
      ],
      "required": true,
      "variants": [
        {
          "when": {
            "path": [
              "docs/plan/ITM-{nnn}-{slug}.md"
            ]
          },
          "rule": "A PLAN STEP NAMES THE TESTS OF ITS LEVEL"
        }
      ]
    },
    "realises": {
      "type": "list",
      "item": {
        "type": "either",
        "of": [
          "requirement",
          {
            "type": "identifier",
            "of": [
              "UC"
            ]
          }
        ]
      },
      "required": true,
      "nonEmpty": true,
      "variants": [
        {
          "when": {
            "path": [
              "docs/backlog/ITM-{nnn}-{slug}.md"
            ]
          },
          "rule": "A BACKLOG ITEM NAMES WHAT IT REALISES"
        }
      ]
    },
    "modules": {
      "type": "list",
      "item": {
        "type": "identifier",
        "of": [
          "MOD"
        ]
      },
      "required": true,
      "nonEmpty": true,
      "variants": [
        {
          "when": {
            "path": [
              "docs/backlog/ITM-{nnn}-{slug}.md"
            ]
          },
          "rule": "A BACKLOG ITEM NAMES THE MODULES IT CHANGES"
        }
      ]
    },
    "integrates": {
      "type": "identifier",
      "of": [
        "ARC"
      ],
      "required": false,
      "requiredWhen": {
        "field": "level",
        "in": [
          "subsystem"
        ]
      }
    },
    "builds_on": {
      "type": "list",
      "item": {
        "type": "identifier",
        "of": [
          "ITM"
        ]
      },
      "required": false
    },
    "tests": {
      "type": "list",
      "item": {
        "type": "enum",
        "values": [
          "unit",
          "component",
          "system",
          "release"
        ]
      },
      "required": true,
      "variants": [
        {
          "when": {
            "path": [
              "docs/plan/ITM-{nnn}-{slug}.md"
            ]
          },
          "rule": "A PLAN STEP NAMES THE TESTS OF ITS LEVEL"
        }
      ]
    },
    "origin": {
      "type": "list",
      "item": {
        "type": "text"
      },
      "required": true,
      "rule": "EVERY ARTIFACT NAMES ITS ORIGIN"
    },
    "built_by": {
      "type": "list",
      "item": {
        "type": "sha",
        "digits": 40
      },
      "required": false,
      "rule": "PROGRESS AND JOB STATE ARE DERIVED, NOT STORED"
    }
  },
  "title": "# {id} {title}",
  "sections": [
    {
      "heading": "## Outcome",
      "required": true
    },
    {
      "heading": "## Acceptance",
      "required": true
    }
  ],
  "otherSections": "allowed",
  "noHistory": true,
  "key": [
    "title"
  ]
}
```
