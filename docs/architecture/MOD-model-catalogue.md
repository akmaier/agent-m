---
id: MOD-model-catalogue
title: Process models and practices as data, and their validation
folder: src/model-catalogue/
realises:
follows:
  - ARC-042
uses:
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-documents.loadSchema
  - MOD-documents.readDocument
  - MOD-documents.documentFindings
  - MOD-repository-hosts.Snapshot
  - MOD-text-tools.Finding
  - MOD-text-tools.finding
provides:
  - Model
  - Catalogue
  - catalogue
  - modelSchema
  - modelFindings
  - planGrid
  - modelDiagram
---
# MOD-model-catalogue Process models and practices as data, and their validation

## Responsibility

It belongs to Process (ARC-042). It holds the catalogue of process models and practices as data (`THE CATALOGUE IS DATA`):
the book's models — waterfall, V-model, reuse-oriented, Scrum, Kanban — and, separately, its practices — DevOps,
prototyping, incremental delivery, the scaling layers of disciplined agile delivery (`AGENT M CARRIES THE BOOK'S
CATALOGUE`, `A PRACTICE IS NOT A MODEL`) — beside the instance's own models. It validates a definition before any product
may declare it (`A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED`), derives the plan of every accepted requirement in
every phase of a planned model (`A PLAN COVERS THE WHOLE SPECIFICATION`), and draws a model as a diagram. It runs in the
browser and in Node.

## Parts

- `index.mjs` — the interface.
- `model.schema.md`, `practice.schema.md` — the schemas of a model and of a practice, in MOD-documents' schema language.
- `models/` — the shipped models, one file each: `waterfall.md`, `v-model.md`, `reuse-oriented.md`, `scrum.md`,
  `kanban.md`.
- `practices/` — the shipped practices, one file each: `devops.md`, `prototyping.md`, `incremental-delivery.md`,
  `scaling-layers.md`.
- `validate.mjs` — the rules a schema cannot express.
- `plan.mjs` — the plan of requirements times phases.
- `diagram.mjs` — the Mermaid text of a model.

## Data

It keeps nothing beyond its shipped data files. It owns two formats.

**Schema `model`** (`model.schema.md`), for a shipped model and for `docs/process-models/<name>.md` of the instance:

| Part of the schema | Value |
|---|---|
| front matter | `name`; `kind` (`planned` or `pulled`); `adapted_from` (the model it was adapted from, if any); `measure` (`plan entries per phase`, `remaining items per time box` or `items per state over time`) |
| `## About` | optional, before `## Phases`: the lines `manages:` — the risk the model manages well —, `accepts:` — the risk it accepts —, `example:` — an example project it suits — and `chapter:` — the chapter of the book that explains it |
| `## Phases` | a table: `Name`, `Role`, `Produces` (the kinds of artifact, among requirements, `UC`, `ARC`, `MOD`, `TST`, `ITM`, sprint record; a kind may be followed by an explanation in parentheses, which no check reads) |
| `## Transitions` | a table: `From`, `To`, `Kind` (`sequence`, `alternative`, `back`) |
| `## Verification pairs` | a table: `Phase`, `Checked by` |
| `## Gates` | a table: `Between` (`<phase> → <phase>`), `Artifacts`, `Condition`, `Decider` (a role of the model, or `check: <CI check name>`) |
| `## Roles` | a table: `Name`, `Filled by` (`person`, `agent` or `either`), `Capabilities` |
| `## Flow control` | for `pulled` only, a table `Kind`, `Value` with the rows `WIP limit`, `Time box`, `Sprints`; the value `none` of `WIP limit` or `Time box` means the model sets none |

Free text may stand between the title and the first section. A shipped model's file is in exactly this format; an
instance's model adapted from another names it in `adapted_from`. Every shipped model has `## About`, taken from the
book: it is what UC-002 shows beside each model. An instance's model may have it.

**Schema `practice`** (`practice.schema.md`): front matter `name` and `fits` (the models it can be added to); the
sections `## Adds` — the phases, gates, roles or artifacts it adds, in the tables of the model schema — and `## What it
is` — its explanation for someone new to it, with the book chapter.

## Interfaces

- `Model` — a model read by its schema: `{ name: string, kind: "planned" | "pulled", adaptedFrom: string | null,
  measure: string, about: { manages: string, accepts: string, example: string, chapter: string } | null, phases:
  Array<{ name: string, role: string, produces: string[] }>, transitions: Array<{ from: string, to: string, kind: string
  }>, pairs: Array<{ phase: string, checkedBy: string }>, gates: Array<{ from: string, to: string, artifacts: string,
  condition: string, decider: string }>, roles: Array<{ name: string, filledBy: string, capabilities: string[] }>, flow:
  { wip: number | null, timeBox: string | null, sprints: boolean } | null, version: string, path: string }`.
  - `about` is what the model's `## About` says, and `null` for a model without one.
  - `version` is the blob of the file the model was read from. A product names the version it declared by the commit of
    the instance that holds it (MOD-product-process). The model read at that commit and the model read now differ
    exactly when their `version`s do (UC-031 6a).
- `Catalogue` — `{ models: Model[], practices: Array<{ name: string, fits: string[], path: string }>, findings:
  Record<string, Finding[]> }`: what `catalogue` returns.
- `catalogue(instance: Snapshot) -> Catalogue` — the shipped models and practices and the instance's models, each
  instance model with its findings; a shipped model is offered for adapting, never for editing in place. Over the
  instance's snapshot at the commit a product's declaration names, it holds the instance's models as they stood at that
  commit: the version the product declared (UC-031 6a).
- `modelSchema: { model: Schema, practice: Schema }` — the two schemas, for MOD-documents and for the form a person edits
  a model in.
- `modelFindings(model: Document) -> Finding[]` — every rule a definition must keep, each finding beside the field that
  causes it: a transition naming a phase that is not defined, or a phase no transition reaches from the first phase; a
  verification pair naming a missing phase; a gate without artifacts, without a condition or without a decider; a role
  without capabilities, or a phase without a role; a gate that checks a kind of artifact no earlier phase produces; for
  `pulled` work, neither a time box nor a work-in-progress limit, or both; a measure that does not fit the kind of work;
  no declaration of planned or pulled. A definition with an error finding can be declared by no product.
- `planGrid(requirements: string[], model: Model) -> { entries: Array<{ requirement: string, phase: string }>, count:
  string }` — for a planned model, every accepted requirement once in every phase — `N × P` entries — and the count as
  the person reads it, for example `42 requirements × 7 phases = 294 plan entries`; empty phases for no requirement.
  Errors: `NotPlanned` for a pulled model.
- `modelDiagram(model: Model) -> string` — the Mermaid text of the phases, transitions, verification pairs and gates.

## Files

- Reads its own `models/` and `practices/`, and the instance's `docs/process-models/*.md`.
- Writes nothing; a person's model is committed by the page through Access, as the person's own input.

## Uses

- MOD-documents.Schema, Document, loadSchema, readDocument, documentFindings — reading a definition by its schema and the
  checks a schema expresses.
- MOD-repository-hosts.Snapshot — the instance's files.
- MOD-text-tools.Finding, finding — the findings of a definition.
