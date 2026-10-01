# The approval gates characterised — counter-proofs and findings (ITM-014)

**MESSUNG** — 2026-10-01, branch `team/ITM-014` (on `sprint/02` at `7f68964`), tests at `0187c06`, macOS, Node 25.9.0,
Python 3.14.6, git 2.54.0. developer-opus-c (claude-opus-5-5).

The counter-proofs of the checks ITM-014 adds for the approval gates the code already keeps
(`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`, SOFTWARE_MAINTENANCE §4.0a rule 5), and the four places where the code
does not keep the SPEC's rule. ITM-014 is a refactoring job: no code changed, no expected result of an existing test changed.

## Suites

| | before (`7f68964`) | after (`0187c06`) |
|---|---|---|
| `node --test tests/*.test.mjs` | 318 tests — 315 pass, 3 todo | 323 tests — 318 pass, 5 todo |
| `cd tests && python3 -m unittest` | 197, OK | 209, OK (2 expected failures) |

The three todo marks of `tests/release-sprint-01-dashboard-app.test.mjs` (R1–R3) are unchanged.

## What each new check adds

The fixture product is `tests/fixtures/gates/`: a use case, an architecture decision, a module, a queue of two SPEC
entries and a job record, written without any approval record.

| Test | SPEC-named check | What it adds to what existed |
|---|---|---|
| `tests/review-core.d/gates.test.mjs` — *A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN …* | `A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN` (`tests/review-core.test.mjs`) | the round trip: files written straight to the branch are open; the engine's own acceptance commit (`planAcceptance`) makes exactly the accepted ones accepted by the names and by the records' content (`recordIndex`, `statusByNames`, `specStatusByNames`); an edit committed afterwards is not accepted; a second acceptance accepts it. Before, the status checks ran on records built by hand. |
| *A GENERATED ARTIFACT IS A PROPOSAL …* | `A GENERATED ARTIFACT IS A PROPOSAL` (`tests/review-core.test.mjs`) | a participant's rewrite after acceptance, a byte-identical copy under another path, and an acceptance of a text the branch no longer holds — none accepted, no record written |
| *A RECORD IS EVIDENCE … approval record for a reviewed file only* | `A RECORD IS EVIDENCE, NOT A PROPOSAL` (`tests/review-core.test.mjs`) | `reviewedRecord` refuses a job record, a gate record and an approval record |
| *… a job record without approval is not listed as open* — **todo G1** | the SPEC's check of `A RECORD IS EVIDENCE, NOT A PROPOSAL`, word for word | fails today; see findings |
| *… an acceptance that names a job record writes no approval record* — **todo G2** | `A RECORD IS EVIDENCE, NOT A PROPOSAL` | fails today; see findings |
| `tests/test_spec_gate.py` — open queue, only the named entry | `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN` (`tests/test_spec_gate.py`) | the workflow (`tools/apply_approvals.py`) leaves every byte of a tree without records as it was, and writes only the entry a record names — no existing test held a queue entry without a record |
| — the dashboard changes no byte outside the section | same | a SPEC with CR LF in other sections: the dashboard's commit keeps them |
| — **expected failure F1** | same | the workflow on the same SPEC; see findings |
| `tests/test_verbatim.py` — eight byte variants, both writers | `THE APPROVED TEXT IS TAKEN VERBATIM` (`tests/test_verbatim.py`) | trailing spaces, tab, no-break space, non-breaking hyphen, line separator, astral characters, a decomposed accent, no final newline — and that both writers write the same bytes |
| — CR LF in a proposal | same | the dashboard writes it as it is; the workflow writes it as it is or nothing (see F2) |
| — **expected failure V1** | same | blank lines ending a proposal; see findings |
| `tests/test_proposal_shows_current.py` — whole section | `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT` (`tests/test_proposal_shows_current.py`) | `sectionForEntry` gives the whole section — a sub-heading and a fenced block that looks like the next heading included |
| — no current text named | same | the dashboard's item without a section SHA and a record without `section:` write nothing — no test held either |
| — anchor twice | same | no current text is shown, and neither writer takes the first occurrence |
| `tests/test_replaced_in_history.py` — both routes | `THE REPLACED TEXT STAYS REACHABLE` (`tests/test_replaced_in_history.py`) | in a real git repository: the commit changes only the SPEC, the decisions (and the record); no file holds the replaced text; it is found from the decision row → record → `git show <commit>^:SPEC.md`, hashing to the record's `section` |

## Counter-proofs

**Method.** `scratchpad/itm014-developer-opus-c/mutate.txt` (not committed) replaced, for each mutation, exactly one
occurrence of a text in `docs/assets/review-core.mjs` or `tools/apply_approvals.py` (P3: two), ran
`cd tests && python3 -m unittest -v test_spec_gate test_verbatim test_proposal_shows_current test_replaced_in_history` and
`node --test --test-name-pattern '^(A REVIEWED ARTIFACT|A GENERATED ARTIFACT|A RECORD IS EVIDENCE)' tests/review-core.test.mjs`,
and wrote the file's original bytes back. Before and after the series both suites were green; `git diff` of the two
code files was empty after it. A test is listed as red when unittest reported FAIL or ERROR, or node marked it ✖.

| Mutation | Red |
|---|---|
| J1 `deriveReviewedStatus` accepts a file any record of its kind and path names, whatever text | node: *A REVIEWED ARTIFACT …*, *A GENERATED ARTIFACT …* |
| J2 `statusByNames` takes any record named for the identifier as naming the current text | node: *A REVIEWED ARTIFACT …*, *A GENERATED ARTIFACT …* |
| J4 `reviewedRecord` makes a use-case record for a path of no reviewed kind | node: *A RECORD IS EVIDENCE … reviewed file only …* |
| J5 `planAcceptance` does not compare the file on the branch with the text shown | node: *A GENERATED ARTIFACT …* |
| J6 `sectionForEntry` shows only the heading of the current section | `test_the_current_text_beside_an_entry_is_the_whole_section`; node: *A REVIEWED ARTIFACT …* |
| J7 `planAcceptance` compares the SPEC section only when the item names one | `test_an_approval_that_names_no_current_text_is_not_written` |
| J8 `extractSection` takes the first of several anchors | `test_a_current_text_that_cannot_be_told_is_not_guessed` |
| J9 `replaceSection` trims the end of every proposal line | `test_both_writers_write_the_approved_text_byte_for_byte`, `test_cr_bytes_of_a_proposal_are_never_written_reformulated` |
| J10 `replaceSection` writes the proposal in Unicode NFC | `test_both_writers_write_the_approved_text_byte_for_byte` |
| J11 `planAcceptance` writes the SPEC with LF line ends throughout | `test_the_dashboard_changes_no_byte_outside_the_accepted_section` |
| J12 `planAcceptance` keeps a copy of the replaced section beside the queue | `test_the_dashboard_leaves_the_replaced_text_in_the_history_only` |
| J13 the record `planAcceptance` writes does not name the section shown | `test_the_dashboard_leaves_the_replaced_text_in_the_history_only` |
| P1 the workflow writes every proposal of every queue, approved or not | `test_an_open_queue_is_not_written_by_the_workflow`, `test_only_the_entry_a_record_names_is_written_by_the_workflow`, `test_the_workflow_leaves_the_replaced_text_in_the_history_only`, and four more |
| P2 the workflow writes every entry of a queue it holds a record for | `test_only_the_entry_a_record_names_is_written_by_the_workflow`, `test_both_writers_write_the_approved_text_byte_for_byte` |
| P3 the workflow applies a record without `section:` (compared only when named) | `test_an_approval_that_names_no_current_text_is_not_written` |
| P4 `extract_section` takes the first of several anchors | `test_a_current_text_that_cannot_be_told_is_not_guessed` |
| P5 the workflow strips the end of every proposal line | `test_both_writers_write_the_approved_text_byte_for_byte` |
| P6 the workflow writes the proposal in Unicode NFC | `test_both_writers_write_the_approved_text_byte_for_byte` |
| P7 the workflow keeps a copy of the replaced section beside the queue | `test_the_workflow_leaves_the_replaced_text_in_the_history_only` |
| P8 the decision row names no approval record | `test_only_the_entry_a_record_names_is_written_by_the_workflow`, `test_the_workflow_leaves_the_replaced_text_in_the_history_only` |

Every new test that is not marked is red under at least one mutation: the three of `gates.test.mjs` and the ten of the four
Python files.

**The marked cases are red on the current code, at their finding.** Run without their mark, `test_the_workflow_changes_no_byte_outside_the_approved_section`
fails at its last assertion (`test_spec_gate.py:140`, the SPEC compared after `rc` 0) and
`test_blank_lines_at_the_end_of_a_proposal_are_written` at the dashboard's SPEC (`test_verbatim.py:128`); the two todo
cases of `gates.test.mjs` fail at *the job record is no proposal* (after the use case's half passed) and at *no approval
record for a job record*. Known positive first (CLAUDE.md §6a.2): the use case's half of G1 passes, and the same SPEC with
LF only is written correctly by the workflow (`test_only_the_entry_a_record_names_is_written_by_the_workflow`).

## Findings

Each is a place where the code does not keep the SPEC's rule; none is fixed here (refactoring job). Probes:
`scratchpad/itm014-developer-opus-c/probe1.txt`, `probe2.txt` (not committed).

- **F1 — the workflow rewrites the SPEC outside the approved section.** `tools/apply_approvals.py`, `apply()`:
  `spec = target.read_text(encoding="utf-8")` reads with universal newlines (CR LF → LF), `target.write_text(out, …)`
  writes the whole file back. A SPEC with CR LF anywhere is written with LF throughout: bytes of sections nobody approved
  change (`A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`). Measured: SPEC `"# S\r\n\r\n## 1. One\r\n…"`, record for
  `## 2. Two` → `rc 0`, `applied`, SPEC now begins `"# S\n\n## 1. One\n…"`; the dashboard's commit keeps the CRs.
  Test: `test_spec_gate.py`, expected failure.
- **F2 — the workflow refuses an unchanged proposal with CR LF line ends.** Same reading: `prop` read with universal newlines
  no longer hashes to the record's `blob`, so the record is refused as `proposal changed after approval` although nothing
  changed. Nothing reformulated is written — `THE APPROVED TEXT IS TAKEN VERBATIM` holds, and the test pins only that —, but
  the instance's workflow does not write an approved change byte for byte (`WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES
  THE CHANGE`, ITM-016's requirement) and names a wrong reason. Measured: proposal `"## 2. Two\r\n\r\nnew two\r\n"` →
  `rc 1`, `refused — proposal changed after approval`; the dashboard writes it with its CRs.
- **V1 — blank lines that end an approved proposal are not written.** Both writers strip a proposal's final newlines and
  write one: `review-core.mjs` `replaceSection` (`proposal.replace(/\n+$/, "")`), `apply_approvals.py` (`prop.rstrip("\n")`).
  A proposal `"…\tindented by a tab.\n\n"` is written as `"…\tindented by a tab.\n"` before the next heading. Whether a
  proposal's trailing blank lines are part of "exactly what stands in the approval field" is the Product Owner's call; the
  test is marked so that it is not pinned as correct either way. Test: `test_verbatim.py`, expected failure.
- **G1 — the approval engine gives a job record the status of a proposal.** `review-core.mjs` `deriveReviewedStatus`
  takes the kind from the path (`kindOfPath`, `null` for `docs/jobs/…`), finds no record of kind `null`, and answers
  `"open"`; `statusByNames` answers `{ status: "open" }`; `reviewPage` shows and counts such an entry. The same holds for a
  gate record and for an approval record itself. Today no view lists `docs/jobs/` — the use-case and architecture views
  select their files by path (`dashboard/review-views.mjs` `ucEntries`, `archEntries`, MOD-dashboard-app) — so the rule is
  kept by the views' filters, not by the engine whose module realises it. MOD-review-core's interface gives no other value:
  "`deriveStatus(path, currentBlob, records) -> "open" | "accepted" | "changed"`". Test: `gates.test.mjs`, todo.
- **G2 — the engine writes an approval record for a job record handed to it as a use case.** `planAcceptance` builds a
  non-architecture item's record with `useCaseRecord(it.path, it.blob)` — the kind from the item, not from the path — and
  wrote `docs/approvals/JOB-20261001-0900-a1b2-c97d9f2bf14c.md` = `kind: use-case` / `file: docs/jobs/JOB-20261001-0900-a1b2.md`.
  `reviewedRecord`, used for decisions and modules, refuses the same path. Test: `gates.test.mjs`, todo.

Observed on the way, not a check of this item: `reviewedId("docs/jobs/JOB-20261001-0900-a1b2.md")` is `JOB-20261001`, not
the job's identifier — the reviewed-file pattern `[A-Z]+-\d{3,}` stops at the first hyphen of a JOB identifier.
