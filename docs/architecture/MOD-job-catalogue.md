---
id: MOD-job-catalogue
title: Every kind of job, as data
folder: src/job-catalogue/
realises:
follows:
  - ARC-046
uses:
  - MOD-documents.loadSchema
  - MOD-documents.readDocument
  - MOD-documents.documentFindings
  - MOD-documents.readRegister
  - MOD-text-tools.Finding
  - MOD-participant-list.Capability
provides:
  - KindDefinition
  - kindNames
  - kindOf
---
# MOD-job-catalogue Every kind of job, as data

## Responsibility

It belongs to Participants and jobs (ARC-046). It holds every kind of job Agent M runs — about twenty-five — as data,
exactly once (`ONE DEFINITION, THREE DRIVERS`, `THE CATALOGUE IS DATA`): for each kind, one folder with its definition,
its prompt and the schema of the answer it expects; and the schema every definition follows. A new kind that reuses the
strategies modules already offer is a new folder and a line in the index; no code changes (`OPEN FOR EXTENSION, CLOSED
FOR CHANGE`). It runs unchanged in a browser and in Node; it reads only its own data files.

## Parts

- `index.mjs` — the interface.
- `kinds.md` — the index: one row per kind, its name and folder.
- `definition.schema.md` — the schema of a kind's definition, in the schema language of MOD-documents.
- `kinds/<name>/kind.md` — a kind's definition.
- `kinds/<name>/prompt.md` — its prompt, in English, data only.
- `kinds/<name>/answer.schema.json` — the shape of the draft it expects back.

## Data

**A kind's definition**, `kinds/<name>/kind.md`, is a document whose front matter holds:

| Key | Value | Meaning |
|---|---|---|
| `name` | the kind's name, the folder's name | how jobs, records and runs name it |
| `serves` | use-case identifiers | the use cases whose jobs it runs |
| `participant` | `one` or `none` | `none` for a kind done without a participant, such as setting up CI |
| `needs` | capabilities of `A PARTICIPANT DECLARES ITS CAPABILITIES` | what its participant must declare |
| `resources` | `none` or `product` | whether a job of the kind may need the product's resources, which then decide its routes (`A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE`) |
| `preconditions` | strategy names | what must hold before it starts |
| `recipes` | strategy names, a name ending in `?` for a part that may be left out with its reason | how its input is assembled |
| `checks` | strategy names | the checks of every round |
| `person_decides` | requirement names | the rules whose findings go to a person and never back to the participant |
| `reviewer` | a kind's name, or nothing | the kind its reviewing participants run |
| `reviewers` | a number | how many reviewing participants, each differing from the drafter, and from each other, in participant and model |
| `steps` | strategy names | what runs once the loop has ended |
| `gate_points` | `before-write`, `before-merge`, `question` | where a gate of the product's workflow, or a question to the author, stops a job |
| `review` | `person` or `none` | `person`: where a person attends the job, its result waits for them — the page shows the draft, they may change it, and only their click lets it go on; `none`: the writer runs as soon as the loop and the steps have ended. Where nobody attends — on CI, on a Bridge that runs the job, in a run — every result is written at once |
| `writer` | a strategy name | what writes the result |
| `limit` | a number | the default number of correction rounds, fixed before the first round |

Its body is one section, `## Purpose`, saying in a paragraph what the kind does. The prompt is data: plain text with
named places for the parts, never code. The answer's schema is a small JSON description — `type`, `properties`,
`required`, `items`, `enum` — of the `draft`; every answer has the same envelope, `{ "draft": …, "answers": [ { "finding":
<the finding's line>, "how": "fixed" | "justified" | "answered", "text": … } ] }`, so that the runner can read the draft
and the drafter's answer to every finding of the last round.

**The kinds.** Each strategy a definition names is offered by the module that owns its knowledge, as its subsystem's
decision says (ARC-041 to ARC-046); `instruction`, `draft` and `return-draft`, and the checks on the artifact model, are
built into MOD-job-runner.

| Kind | Serves | Participant needs | Preconditions | Recipes | Checks | Reviewers | Steps | Review · writer | Draft it expects |
|---|---|---|---|---|---|---|---|---|---|
| `derive-requirements` | UC-005 | draft text | | `source-excerpt`, `spec-with-queues` | `requirement-form`, `candidate-classes` | | | `person` · `queue-entries` | candidates: name, rule, check, what it constrains, source passage, class |
| `change-requirements` | UC-019, UC-012 | draft text | | `instruction`, `named-requirements`, `spec-with-queues` | `requirement-form`, `candidate-classes` | | | `person` · `queue-entries` | the same |
| `derive-use-cases` | UC-007 | draft text | `rests-on-accepted` | `chosen-requirements`, `use-cases` | `document-schema`, `graph-checks`, `candidate-classes` | | | `none` · `open-files` | files |
| `change-use-case` | UC-019 | draft text | | `instruction`, `use-case-with-neighbours` | `document-schema`, `graph-checks`, `identifier-kept` | | | `person` · `open-files` | files |
| `derive-architecture` | UC-022 | draft text | `architecture-ready` | `whole-spec`, `accepted-use-cases` | `document-schema`, `graph-checks`, `candidate-classes` | `review-architecture` × 1 | `due-diligence` | `person` · `open-files` | files |
| `change-architecture` | UC-023 | draft text | `rests-on-accepted` | `instruction`, `whole-spec`, `use-cases`, `whole-architecture` | `document-schema`, `graph-checks`, `identifier-kept`, `candidate-classes` | `review-architecture` × 1 | `due-diligence` | `person` · `open-files` | files |
| `review-architecture` | UC-022, UC-023 | draft text | | `whole-spec`, `accepted-use-cases`, `draft` | | | | `none` · `return-draft` | findings, each a warning |
| `propose-groups` | UC-021 | draft text | | `items-of-kind` | `group-rules` | | | `none` · `return-draft` | moves |
| `draft-plan` | UC-045 | draft text | `rests-on-accepted` | `architecture-and-model` | `plan-checks` | | | `person` · `plan-steps` | steps |
| `propose-items` | UC-032 | draft text | `rests-on-accepted` | `backlog-inputs` | `backlog-checks`, `candidate-classes` | | | `person` · `backlog-items` | items |
| `close-sprint` | UC-041 | draft text, read the repository, write to the repository | | `sprint-facts` | `sprint-record-checks` | | | `none` · `sprint-record` | the review, the retrospective, the proposed changes |
| `implement` | UC-024, UC-034, UC-043 | write to the repository, run code and tests | `rests-on-accepted` | `implementation-inputs` | | | | `none` · `branch-and-pull-request` | the agent's report: branch, commits, pull request |
| `refactor` | UC-024 | write to the repository, run code and tests | `rests-on-accepted` | `implementation-inputs` | | | | `none` · `branch-and-pull-request` | the same |
| `decide-gate` | UC-034, UC-036 | read the repository | | `gate-inputs` | | | | `none` · `gate-record` | the decision and its reasoning |
| `set-up-ci` | UC-043, UC-027 | — | | | | | | `none` · `ci-configuration` | — |
| `propose-tests` | UC-026, UC-043 | read the repository, write to the repository, run code and tests | `rests-on-accepted` | `test-selection` | `test-proposals`, `candidate-classes` | | | `person` · `return-draft` | test cases: identifier, level, what each guards, precondition, input, expected result, class |
| `write-tests` | UC-026, UC-043 | read the repository, write to the repository, run code and tests | `rests-on-accepted` | `draft`, `test-selection` | `test-declarations`, `test-proposals` | | | `none` · `branch-and-pull-request` | the agent's report: branch, commits, pull request; each test with its outcome and its counter-proof, or why it was not written |
| `run-tests` | UC-028, UC-013 | run code and tests | | `commit-and-levels` | | | | `none` · `result-record` | the outcomes |
| `analyse-issue` | UC-012 | draft text | | `issue-context` | | | | `none` · `return-draft` | the class and its reasoning |
| `fix-bug` | UC-012 | write to the repository, run code and tests | | `fix-inputs` | | | | `none` · `branch-and-pull-request` | the agent's report |
| `propose-issues` | UC-038 | draft text | | `mail-batch` | `people-search` | | | `none` · `return-draft` | one proposal per mail |
| `rewrite-without-persons` | UC-038 | draft text | | `report-data` | `people-search` | `check-for-persons` × 3 | | `none` · `return-draft` | the rewritten text |
| `check-for-persons` | UC-038 | draft text | | `draft` | | | | `none` · `return-draft` | findings |
| `draft-replies` | UC-039 | draft text | | `reply-inputs` | | | | `none` · `mail-drafts` | one reply per mail |
| `check-resource` | UC-040 | run code and tests | | `resource-check` | | | | `none` · `return-draft` | what answered |

For a kind of `review: person`, the click that lets the result go on is the one its use case names: *Write proposals*
(UC-005, UC-022), *Save* (UC-019, UC-023), *Save plan* (UC-045), *Add to backlog* (UC-032) — each through MOD-job-runner's
`writeResult`, which runs the kind's steps and its writer on the draft as the person left it —, and *Write tests*
(UC-026), which starts a job of `write-tests` whose parameters carry the cases as the person left them, for its recipe
`draft`. Test generation is two kinds because the person decides on the cases between proposing and writing them. Inside
a run nobody attends (UC-043): `propose-tests` ends with its cases in its job's record, and `write-tests` follows it
without a click, with those cases as its parameters. On `write-tests`, `test-proposals` holds the written tests against
the cases it was handed, each with its counter-proof.

For `derive-requirements`, `change-requirements` and the architecture kinds, `person_decides` names `A CONFLICT IS
DECIDED BY A PERSON`. For `implement`, `refactor` and `fix-bug`, `gate_points` names `before-merge` and `question`, the
latter for tests that pass before any code exists (UC-024, UC-034); for `write-tests`, `before-merge`. `implement`,
`refactor`, `fix-bug`, `write-tests` and `run-tests` have `resources: product`.

**An example definition**, `kinds/derive-architecture/kind.md`:

```markdown
---
name: derive-architecture
serves:
  - UC-022
participant: one
needs:
  - draft text
resources: none
preconditions:
  - architecture-ready
recipes:
  - whole-spec
  - accepted-use-cases
checks:
  - document-schema
  - graph-checks
  - candidate-classes
person_decides:
  - A CONFLICT IS DECIDED BY A PERSON
reviewer: review-architecture
reviewers: 1
steps:
  - due-diligence
gate_points:
review: person
writer: open-files
limit: 5
---
## Purpose

Drafts a product's first architecture as a whole, from the whole SPEC and every accepted use case, in the order from the
system to its modules: context, patterns, subsystems, the four views, the scenarios, the testing, the subsystems'
decisions, the module files, the further decisions.
```

## Interfaces

- `KindDefinition` — `{ name: string, serves: string[], participant: "one" | "none", needs: Capability[], resources: "none"
  | "product", preconditions: string[], recipes: { name: string, optional: boolean }[], checks: string[], personDecides:
  string[], reviewer: string | null, reviewers: number, steps: string[], gatePoints: ("before-write" | "before-merge" |
  "question")[], review: "person" | "none", writer: string, limit: number, purpose: string, prompt: string, answer: object
  }`: a definition as read, its prompt and the schema of its draft loaded with it.
- `kindNames() -> Promise<string[]>` — the names of every kind in the index, in its order.
- `kindOf(name: string) -> Promise<KindDefinition>` — the kind's definition, prompt and answer schema, read once per
  program and kept. Throws `UnknownKind { name }` for a name the index does not hold, and `InvalidKind { name, findings }`
  for a definition MOD-documents finds at odds with the definition schema. It does not check that the strategies a
  definition names exist: MOD-job-runner does, when a job is prepared.

## Files

It reads its own data files: `kinds.md`, `definition.schema.md` and the three files of each kind. It writes nothing.

## Uses

- `MOD-documents.loadSchema`, `MOD-documents.readDocument`, `MOD-documents.documentFindings` — the definition schema, the
  definitions, and their check.
- `MOD-documents.readRegister` — the index of kinds.
- `MOD-text-tools.Finding` — the findings an invalid definition carries.
- `MOD-participant-list.Capability` — the type of what a kind's participant needs.
