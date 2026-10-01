# applyApprovals in the approval engine — the twin of tools/apply_approvals.py, counter-proofs and differences (ITM-016)

**MESSUNG** — 2026-10-01, branch `team/ITM-016` (on `sprint/02` at `a269411`), tests at `9df0bb6`, macOS, Node 25.9.0,
Python 3.14.6. developer-opus-c (claude-opus-5-5).

`applyApprovals({ read, now })` (`docs/assets/review-core/apply-approvals.mjs`, MOD-review-core) writes what the instance's
apply workflow writes for every `kind: spec` record not yet applied. This file records the suites, the counter-proofs of the
new tests (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`), and every place where the engine and `tools/apply_approvals.py`
do not write the same bytes, with the reason.

## Suites

| | before (`a269411`) | tests only (`9df0bb6`) | with the engine |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 332 tests — 327 pass, 5 todo | 337 — 327 pass, **5 fail**, 5 todo | 337 — 332 pass, 5 todo |
| `cd tests && python3 -m unittest` | 246, OK (2 expected failures) | 256, **FAILED** (38 failures, counted per sub-test; 5 expected failures) | 256, OK (5 expected failures) |

CI on `9df0bb6`: red — runs 36927296589 and 36927323619 (pull request #55). The five todo marks (R1–R3 of the sprint 01
release tests, G1 and G2 of ITM-014) and the expected failures F1 (`test_spec_gate.py`) and V1 (`test_verbatim.py`) are
unchanged; the three new expected failures are the twin comparisons of F1, F2 and F3 below.

## The port

`read(path)` gives, on the commit the workflow runs on, a file's text — its bytes decoded as UTF-8, no line end
translated — or `null`; for a folder, a path ending in `/`, the names of the files in it, or `null`. The records are found
by reading `docs/approvals/`. MOD-review-core's interface line names the ports `{ read, now }` and does not say how the
records are found; the folder read is how this engine finds them without a further port.

## What the new tests check

| Test | Check the SPEC names | What it checks |
|---|---|---|
| `tests/test_apply_approvals.py` `Twin` — 32 cases | `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`, `A STALE APPROVAL IS NOT APPLIED` | the same tree before both; afterwards byte-identical trees and the same `(rc, report)`: nothing approved, one entry, two entries of one queue, a stale proposal, a stale section, one of two stale, an anchor not the queue's (and with `'`, with both quotes and `\`), a proposal outside its queue or climbing out of it, a queue outside `docs/spec-freigaben/`, a queue without `index.md`, one and two missing keys, no such entry, a deleted proposal, an anchor twice, the README with example records, records of a use case, a decision and a module, a record the dashboard's commit already applied, no decisions file yet, a SPEC without a final newline, and the nine byte variants of `tests/test_verbatim.py` |
| — a second run | same | both sides write nothing more on a second run |
| — the cases apply, refuse and pass over | — | known positive: the case table yields an applied record, a refused one, and a run that writes nothing |
| `EngineKeepsTheBytes` — four tests | `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` | CR bytes outside the section stay; a CR LF proposal is written byte for byte; an unchanged section holding a CR is replaced; counter-proof: a changed section holding a CR is still refused |
| `TwinWhereThePythonToolIsWrong` — three, expected to fail | — | the twin comparison on F1, F2 and F3; each fails at its finding (below) |
| `tests/review-core.d/apply-approvals.test.mjs` — five | `A STALE APPROVAL IS NOT APPLIED` (`tests/review-core.test.mjs`), `WITHOUT A TOKEN, …` | a changed proposal or section is refused and named, counter-proof applied; the engine's files equal the dashboard's acceptance commit (`planAcceptance`) for two entries ticked in reverse order, also when the decisions file ends without a newline; a second run writes nothing; malformed records (missing key, entry no number, target missing, proposal outside its queue, anchor not the queue's) refused and named; records read from the folder, README.md, other kinds and non-Markdown passed over |

V1 — blank lines ending a proposal — is not among the twin cases: both writers strip them, and pinning the engine to the
Python tool there would pin an answer to the Product Owner's open question. The engine writes what `planAcceptance` writes.

## Counter-proofs

**Method.** `scratchpad/itm016-developer-opus-c/mutate.txt` (not committed) replaced, for each mutation, exactly one
occurrence of a text in `docs/assets/review-core/apply-approvals.mjs`, ran `cd tests && python3 -m unittest -v
test_apply_approvals` and `node --test tests/review-core.test.mjs`, and wrote the file's original bytes back (checked
equal after the series). Both were green before the series. A Python test counts as red on FAIL or ERROR, a node test on ✖;
a marked case that passes under a mutation counts as an *unexpected success*. The first run of the series read node's
output with a TAP pattern and found nothing red on the node side — the reporter writes `✖`, not `not ok`; the pattern was
checked against mutation M1 by hand, corrected, and the series run again (CLAUDE.md §6a.2). The table is the second run.

| Mutation | Red |
|---|---|
| M1 the proposal's blob SHA is not compared | twin cases, *the cases apply, refuse and pass over*; node: *A STALE APPROVAL … the engine's workflow route* |
| M2 the SPEC section's blob SHA is not compared | twin cases, *counter-proof a changed section with CR bytes*; node: *A STALE APPROVAL … the engine's workflow route* |
| M3 a record whose decision row exists is applied again | twin cases, *a second run*; node: *… a second run writes nothing* |
| M4 the record's anchor is not compared with the queue's | twin cases, *the cases apply, refuse …*; node: *… a malformed record is refused* |
| M5 a proposal outside its queue is not refused | twin cases; node: *… a malformed record is refused* |
| M6 the records are handled in reverse order of their names | twin cases, *a second run*; node: *… the engine writes what the dashboard's acceptance commit writes* |
| M7 every text in the report is quoted with single quotes | twin cases; node: *… a malformed record is refused* |
| M8 the decision row is appended to a last line without its newline | node: *… the engine writes what the dashboard's acceptance commit writes* |
| M9 README.md is read as a record | twin cases; node: *the records are read from the approvals folder …* |
| M10 the SPEC is read with its line ends translated to LF | *CR bytes outside the approved section stay*, *a section with CR bytes … is replaced*; unexpected success of the F1 and F3 twins |
| M11 the proposal is read with its line ends translated to LF | *a proposal with CR LF line ends is written byte for byte*; unexpected success of the F2 twin |
| M12 an entry that is no number is taken as one | node: *… a malformed record is refused* |
| M13 a missing target is read as an empty SPEC | node: *… a malformed record is refused* |
| M14 a record with a missing key is not refused | twin cases; node: *… a malformed record is refused* |
| M15 a refused record is reported but not counted as refused | twin cases; node: *A STALE APPROVAL … the engine's workflow route*, *… a malformed record is refused* |
| M16 the decision row is dated now, not at `now` | twin cases, *a second run*; node: *… the engine writes what the dashboard's acceptance commit writes* |
| M17 the section is replaced with the proposal's lines trimmed at their end | twin cases, *a proposal with CR LF line ends is written byte for byte* |

Every new test that is not marked is red under at least one mutation. M10 and M11 show that the three marked twins compare
what they claim: with the engine made to read like the Python tool, they pass.

**The marked cases are red on the code at their finding** (`scratchpad/itm016-developer-opus-c/marked.txt`, the twin run
without its mark): F1 — the same report on both sides (`applied`), trees differ in `SPEC.md` only (the engine's holds the
CRs, the tool's none); F2 — tool `(1, '… refused — proposal changed after approval (07301ef55dbd ≠ 767c290b1099)')`, engine
`(0, '… applied — SPEC.md ## 2. More')`; F3 — tool `(1, '… refused — SPEC section changed after approval')`, engine applied.

## Where the engine and the Python tool differ, and why

On every case in the table above they write the same bytes and the same report. They differ here (D4–D6 measured with
`scratchpad/itm016-developer-opus-c/probe.txt`, not committed: D4 — the tool's file reads `Append-only.| 2026-10-01 12:00 UTC
| 1 | …`, the engine's `Append-only.\n| 2026-…`; D5 — record 02, named before the malformed one, was written, then
`ValueError: invalid literal for int() with base 10: 'one'`; D6 — `FileNotFoundError` on the first record, record 02 not
handled; the engine refused the malformed record and applied 02 in both):

| | Case | `tools/apply_approvals.py` | the engine | Why the engine |
|---|---|---|---|---|
| F1 | CR bytes in the SPEC outside the approved section | writes the whole SPEC with LF (`read_text` translates line ends, `write_text` writes the file back) | replaces only the section; every other byte stays | `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN` — no byte of an unapproved section changes. Twin marked expected to fail. Found by ITM-014. |
| F2 | an unchanged proposal with CR LF line ends | refuses: `proposal changed after approval` — its hash of the translated text is not the record's | writes the proposal byte for byte | `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` (byte for byte) and `A STALE APPROVAL IS NOT APPLIED` — the proposal did not change. Twin marked. Found by ITM-014. |
| F3 | an unchanged SPEC section that holds a CR | refuses: `SPEC section changed after approval` — same cause, on the section | replaces it | the same two rules — the section did not change. Twin marked. **New finding of ITM-016.** |
| D4 | the decisions file ends without a newline | appends the row to its last line (`open("a")`), e.g. `Append-only.| 2026-10-01 12:00 UTC | 1 | …` | starts the row on a line of its own | the bytes of `planAcceptance`, which the item names; the dashboard's commit and the workflow's write the same decisions file (node test). |
| D5 | a record whose `entry` is no number | raises `ValueError` — the run stops, records after it are not handled, records before it stay written | refuses the record and names it (`entry 'one' is not a number`), handles the rest | "a stale or malformed record is refused and named" (the item's outcome). |
| D6 | a record whose `target` does not exist | raises `FileNotFoundError`, as D5 | refuses it (`target NOSPEC.md does not exist`) | as D5. |

Not compared, because they need bytes or characters no Agent M file holds: a file that is not valid UTF-8 (the tool raises
`UnicodeDecodeError`; the engine gets what the port decodes — the tests' port decodes strictly and throws, a lenient port
would hand the engine U+FFFD for the bad bytes, and the SPEC would be written with them); digits outside ASCII in `entry` or in
the queue's index (Python's `int()` and `\d` read them, the engine does not); the few whitespace characters that Python's
`strip()` and JavaScript's `trim()` treat differently (`extractSection` and `parseRecord` are those of `planAcceptance`).

The instance's workflow still runs the Python tool (`.github/workflows/apply-approvals.yml`) until ITM-017, so F1–F3 hold
for the no-token route until then; the expected failure F1 of `tests/test_spec_gate.py` tests that tool and stays.
