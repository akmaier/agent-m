# A record handed to an acceptance is left out — counter-proofs (ITM-152)

**MESSUNG** — 2026-10-03, branch `team/ITM-152` (on `sprint/03` at `fc61996`), tests at `99b3ff8`, implementation at
`32f1b29`, macOS, Node 25.9.0, Python 3.14.6. developer-opus-c (claude-opus-5-5).

The counter-proofs of the checks ITM-152 adds and un-marks for finding **G2** of ITM-014
(`docs/measurements/2026-10-01_approval-gates-counter-proofs.md`): `planAcceptance` took the kind of a ticked file from the
item, not from its path, and wrote `kind: use-case` / `file: docs/jobs/JOB-….md` for a job record
(`A RECORD IS EVIDENCE, NOT A PROPOSAL`; `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`, SOFTWARE_MAINTENANCE §4.0a rule 5).

## The change

`docs/assets/review-core.mjs`:

- `planAcceptance` — a non-SPEC item whose path `kindOfPath` does not know (a job, gate, approval or test result record, or
  any other file) is named under `leftOut` with the reason *it is no use case, architecture decision or module — a record is
  evidence and is never accepted*, before its text is read; no file is written for it, whatever kind the item claims.
- `useCaseRecord` — throws `<path> is not a use case (docs/use-cases/UC-<nnn>-<slug>.md)` for a path that is no use case, as
  `reviewedRecord` throws for one that is no reviewed file. Its callers in code hand it use-case paths only:
  `dashboard/review-views.mjs` selects them with the same pattern `kindOfPath` uses (`ucEntries`), and `acceptAllPanel` calls it
  for `kind === "use-case"` items of that list.

## Suites

| | start (`fc61996`) | tests only (`99b3ff8`) | implementation (`32f1b29`) |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 502 tests — 493 pass, 9 todo | 504 tests — 493 pass, **4 fail**, 7 todo | 504 tests — 497 pass, 7 todo |
| `cd tests && python3 -m unittest` | 366, OK (5 expected failures) | 366, **1 failure** (5 expected failures) | 366, OK (5 expected failures) |

The one Python failure on `99b3ff8` is `test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec`, which runs the node suite
inside it and is red because the node suite is. CI on `99b3ff8`: runs 37115765552 (push) and 37115777512 (pull request),
both red in the step *Python checks* on that case; not rerun.

The two G2 cases lose their `{ todo }` mark — `todo` drops from 9 to 7; the seven left are G1 (two cases, ITM-153) and the
five of other strands' findings, unchanged.

## Counter-proofs

Each fault was planted in `docs/assets/review-core.mjs` on `32f1b29`, `tests/review-core.d/gates.test.mjs` and
`tests/release-sprint-02-c-review-core.test.mjs` were run, and the file was restored (its diff against `32f1b29` empty after).

| Planted fault | Red | Green |
|---|---|---|
| M1 — `planAcceptance` without the kind check | *an acceptance handed a job, gate, approval or test result record leaves each out …* (`useCaseRecord` throws for the job record, so the whole acceptance fails); release *an acceptance handed a job record writes no approval record for it* | the G2 case of `gates.test.mjs` — it accepts a thrown acceptance as "nothing written", as ITM-014 wrote it |
| M2 — `useCaseRecord` without its refusal | *useCaseRecord refuses a path that is no use case …* | the rest — `planAcceptance`'s own check keeps the job record out |
| M3 — the kind check leaves out every item | *… leaves each out …* (its counter-proof: the use case is no longer written), and three cases that accept reviewed files (*A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN …*, *A GENERATED ARTIFACT IS A PROPOSAL …*, release *UC-022: a decision is accepted only when everything it names is accepted*) | — |
| M4 — G2 restored: no kind check, no refusal in `useCaseRecord` | all four: both new cases, the G2 case of `gates.test.mjs`, the release G2 case | — |

Each new case is red on at least one fault and on the code before the change (`99b3ff8`), and each un-marked case is red on
M4, the code as G2 found it.

## Not changed

G1 (`deriveReviewedStatus` and `statusByNames` answer *open* for a record; `reviewPage` counts it) keeps its marks; it waits
for `akmaier` (ITM-153). An item whose path is a reviewed file of another kind than the item claims — a use-case item with a
module's path — now makes `useCaseRecord` throw, and the acceptance writes nothing; no view hands such an item, and the item
named no rule for it.
