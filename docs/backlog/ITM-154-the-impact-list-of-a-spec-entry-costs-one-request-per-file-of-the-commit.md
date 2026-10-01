---
id: ITM-154
title: The impact list of a SPEC entry costs one request per file of the commit — 260 on a cold load of Agent M's own repository, more than a page without a token may make
kind: implementation
level: 1
realises:
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - THE TRACEABILITY MATRIX IS DERIVED
  - UC-006
modules:
  - MOD-traceability
  - MOD-dashboard-app
depends_on:
  - ITM-134
origin: sprint 02 review input (ITM-134's measurement record)
---
# ITM-154 The impact list of a SPEC entry costs one request per file of the commit — 260 on a cold load of Agent M's own repository, more than a page without a token may make

**REGISTER**

## Outcome

ITM-134 shows the impact list of an entry that changes or withdraws a requirement (UC-006 3b). Measured
(`docs/measurements/2026-10-02_spec-entry-impact-list.md`, *Requests per load of an entry*): on Agent M's own repository a
cold load of such an entry makes 260 requests (258 files — every use case, architecture file and test of the commit, once
per blob), where an entry that adds only makes 61; warm, 2. Which tests guard a requirement is stated only in each test's
own `Guards:` line, so no smaller set of files can be read as the code stands. Without a token (UC-006 4b — the list is
shown before the GitHub path, release case 15) GitHub allows 60 requests an hour from one network: the first cold load of a
changing entry uses the limit up and the page names it (`A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`) — the
list cannot be shown, and the entry is not offered.

Soll: the list of a changing entry is derived with a bounded number of requests — the order of the files it names, not of
the files of the commit. The way is not decided here. Two candidates, each with a question for `akmaier`:

- **An index derived in CI at every commit** — one file per commit (for example `docs/traceability/headers.json`: every
  test's `Guards:` line and every artifact's names, written by the CI entry from the same readers the graph uses) that
  the page reads in one request and whose commit it checks against the one shown. It is a derived file, never edited by
  hand — but `THE TRACEABILITY MATRIX IS DERIVED` says the matrix "is never stored as a separately edited document", and
  ARC-006 says traceability is computed from one pinned commit; whether a CI-written index of that commit is within both
  is a reading of the SPEC and the architecture.
- **The header lines read from the git host's tree in fewer requests** — no read of that shape exists in MOD-git-host's
  `provides` (a blob's first lines cannot be read without the blob), so it would be a change to its interface.

## Realises

- `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` — the list is shown where the reviewer decides, within the page's request economy
- `THE TRACEABILITY MATRIX IS DERIVED` — whatever is read is derived from the commit shown
- UC-006 — Approve a specification change (3b, 4b)

## Where it came from

Sprint 02 review input: ITM-134's measurement record (developer-opus-d, 2026-10-02) measured the cost; the Scrum Master
raised it at the gate decisions of 2026-10-02 ("an index would be cheaper"). Not a release-test finding; no mark in any test.
The Product Owner filed it so that the next planning weighs it (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*).

Architecture decisions its modules follow: ARC-003, ARC-005, ARC-006, ARC-020.

## Modules

- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core
- MOD-dashboard-app (shells) — `dashboard/spec-changes-view.mjs` `entryImpact`, which chooses what to read

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- to be refined once the way is decided; today's readers are `docs/assets/dashboard/spec-changes-view.mjs` (`entryImpact`) and `docs/assets/traceability/graph.mjs` (`linkGraph`, `headers`)
- `tests/dashboard-spec-impact.test.mjs` (the request count of a changing entry, asserted against a bound)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_impact_list.py` — `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` (exists; not changed by this item)
- `tests/test_matrix_derived.py` — `THE TRACEABILITY MATRIX IS DERIVED` (exists; a derived index, if chosen, must pass it)

## Acceptance criteria

From the postcondition of UC-006 (Approve a specification change), for the part this item builds:

> - The SPEC contains exactly the approved text.

Further:

- A cold load of an entry that changes one requirement of Agent M's own repository makes fewer requests than the network limit without a token allows, measured in the harness as ITM-134's record measured it; the list shown is the same as today's (release cases 14, 15, 17 unchanged).
- Nothing edited by hand is read; a derived file, if one is read, is checked against the commit shown and refused when it is of another.
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-134 — built `entryImpact` (sprint 02, strand D)

## Needs a person

**Yes — `akmaier`:** the way (above) — a CI-derived index of the commit, or a read added to MOD-git-host's interface — is a
reading of `THE TRACEABILITY MATRIX IS DERIVED` and ARC-006, or a change to an accepted module (`docs/process.md`, *Boundary*).
The item waits until then.
