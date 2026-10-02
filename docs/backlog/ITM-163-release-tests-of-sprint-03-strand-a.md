---
id: ITM-163
title: Release tests of sprint 03, strand A — the settings lines, the token line's paste field and the rendered images (ITM-160, ITM-157, ITM-161, ITM-150)
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-008
  - UC-042
modules:
  - MOD-dashboard-app
  - MOD-settings-store
depends_on:
  - ITM-160
  - ITM-157
  - ITM-161
  - ITM-150
origin: sprint 03 planning
---
# ITM-163 Release tests of sprint 03, strand A — the settings lines, the token line's paste field and the rendered images (ITM-160, ITM-157, ITM-161, ITM-150)

**REGISTER**

## Outcome

The items of strand A of sprint 03 (`docs/backlog/sprints/sprint-03.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/03`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/03`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand; the sprint is not closed before every
strand's gate is decided.

What is tested — each rule and flow as the item realised it:

- **ITM-160** — UC-042 step 1, `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`: an untested setting's line
  says it is not tested yet, and nothing of "this page".
- **ITM-157** — `NO SERVER`, UC-008 step 2: a product's use case with an image on a host the page does not name is
  rendered without that image and with its address as text, and no request reaches that host; an image on the product's
  git host and a `data:` image are rendered; the Mermaid diagram of the same file as before.
- **ITM-161** — UC-042 step 1, `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`: a token kept as refused is
  shown as working again after its next successful request with that token; a refusal that stands is still shown.
- **ITM-150** — UC-042 1a and 1b, `A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE`, `AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL
  LINKED`, `THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN`, `A CREDENTIAL IS NEVER PLACED IN A URL`: the warning line of
  every page carries *Renew* and the paste field; a value stored there is in `localStorage` with its date and the line is
  gone when the date is far enough; the refused line and a GitLab project token's line alike; nothing of the token in a URL.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-008, UC-042 — the use cases of the strand's items, tested at level `release`

## Where it came from

Sprint 03 planning (`docs/backlog/sprints/sprint-03.md`), on the Product Owner's practice since sprint 02: release testing
of a sprint's own items is a selected item of that sprint, one per strand, so that the gate *Release testing → Sprint
review* is decided before the close.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-016, ARC-020.

## Modules

- the modules of the strand's items: MOD-dashboard-app (shells), MOD-settings-store (adapters)

The pull request changes only test files that name one of these modules and the measurement record; no code file
changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-03-a.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-03-a-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_03_a.py` (new, only for a check better written over the repository's files)
- `docs/measurements/<date>_release-tests-sprint-03-a.md` (new)

## Kind and level

- Job kind: **refactoring** — tests of merged behaviour, no expected result changed, CI green on every commit. A
  release test that is red on `sprint/03` is a finding that goes **back to Development** (the model's transition
  *Release testing → Development*): it stays in the file marked as expected to fail — `{ todo: true }` under
  `node --test`, `@unittest.expectedFailure` under `unittest` — with the item's identifier; the strand's developer
  takes the item up again on a branch of its own, whose first commit removes the mark (red first, as an
  implementation job) and whose pull request makes it green. The gate for the strand is decided as sprint 02 applied
  the rule: a mark goes back when its fix lies inside the item; a mark that names more than the item said, or a reading
  the Product Owner settles otherwise, is an accepted limitation with an item of its own.
- Level: **1** — browser and hosted CI; nothing installed. The tests' own level line is `Level: release`.

## Tests the SPEC names

- none — the SPEC's named checks are built by the items; these are the use-case tests at level `release` (ARC-016).

## Acceptance criteria

- Every test is written from the text of a use-case flow or a SPEC rule and names it in its `Guards:` line; the
  record lists, per test, the flow or rule and the item it tests. The items' own tests and measurement records
  are not its source; read, if at all, after the release tests are written, to name overlaps in the record.
- The tests run green on `sprint/03` at the commit the record names, after the strand's last item is merged; they are
  run on a clean tree, and no test runs a suite inside itself (sprint 02 retrospective).
- A test's input is a fixture or a frozen copy, never the live backlog, sprint records or pull requests of this
  repository (sprint 02's close broke two tests that pinned live state).
- Every test is shown red on a planted fault, the mutation and the red result recorded (`A NEW TEST IS SHOWN TO
  FAIL ON A PLANTED FAULT`).
- A red test is recorded as a finding with the item it sends back to Development, and marked as expected to fail.
- The pull request's first line names `tester-opus`, the model and the commit it started from; the head comment of
  every release test file says the same (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
- Every test file names its module, what it guards and its one level (ARC-020 decision 2).
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB
  RULES`).

## Depends on

- ITM-160, ITM-157, ITM-161, ITM-150 — every item of the strand, merged into `sprint/03`

## Needs a person

No.
