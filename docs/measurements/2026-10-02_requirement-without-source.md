# A requirement written without any source — the fix of finding C1 and its counter-proofs (ITM-127)

**MESSUNG** — 2026-10-02, branch `team/ITM-127-c1` from `sprint/02` at `5957157`, pull request #67, macOS, Node 25.9.0,
Python 3.14.6. CI runs Node 22 (`.github/workflows/tests.yml`).

**Author.** `developer-opus-c` (claude-opus-5-5), the developer of strand C, taking ITM-127 up again after the Product
Owner's gate decision of 2026-10-02 (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*, mark C1).

## The finding, as a path

`artifacts/checks.mjs:70` `requirementChecks` → `artifacts/requirements.mjs:45` `parseRequirements` → `:25` `HEAD`
(`/^\*\*([^*\n]+)\*\*[ \t]+\*\(([\s\S]*?)\)\*/gm`) needs `*(…)*` on the name line → a name line without it is not read →
`requirementProblems` never runs for it. Ist: `formatChecks("requirement", …)` on `**NO SOURCE GIVEN**` / rule /
`*Occasion:* …` / `*Check:* …` gives `[]`. Soll: one error under `A REQUIREMENT HAS FIVE FIELDS`, "no source", at that
requirement's line (`docs/measurements/2026-10-01_release-tests-sprint-02-c.md`, C1, case 5).

## The fix

`parseRequirements` reads a second kind of name line, `BARE`: the bold name in capitals alone on its line (blanks or a CR
before the line end allowed; no blank just inside the asterisks, which in Markdown makes no bold text). It is a requirement
only when an `*Occasion:*` or `*Check:*` line follows before the next blank line, heading, rule (`---`) or bold line
(`fieldsFollow`). It is read with the source `""`, so `requirementProblems` — unchanged — gives "no source" at its line.
`HEAD` is unchanged, so every requirement that names a source is read exactly as before.

## Runs

| Commit | Python (`cd tests && python3 -m unittest`) | Node (`node --test tests/*.test.mjs`) | CI |
|---|---|---|---|
| `5957157` (start) | 361, OK (expected failures=6) | 494, pass 479, fail 0, todo 15 | — |
| `84ad7be` (red: tests only) | 363, FAILED (failures=2, expected failures=6): the new `test_a_requirement_written_without_any_source_…`, and `test_release_sprint_02_c … test_no_node_test_opens_agent_ms_own_spec`, which runs the node suite and is red while it is | 494, pass 479, fail 1 (release case 5), todo 14 | red — runs 36939426112 (push) and 36939445096 (pull request): *Python checks* failed with the same two failures |
| fix | 363, OK (expected failures=6) | 494, pass 480, fail 0, todo 14 | see the pull request |

The todo count drops by one (15 → 14): release case 5 carries no mark and passes.

## Counter-proofs

`scratchpad/itm127c1-developer-opus-c/mutate.txt` (not committed): one fault planted in `docs/assets/artifacts/requirements.mjs`
at a time, `tests/test_requirement_fields.py` and `tests/release-sprint-02-c-artifacts.test.mjs` run, the file restored
(checked equal afterwards). Before and after the series both are green.

| Id | Planted fault | Red |
|---|---|---|
| MC1 | the reader before the fix: no bare name line is read | `test_a_requirement_written_without_any_source_…`; release case 5 |
| MC2 | a bare name line is a requirement with no field after it | `test_counter_proof_bold_prose_between_requirements_…`, `test_every_requirement_is_read_…`; release cases 1 and 6 |
| MC3 | a bold label with text after it counts as a bare name line | `test_counter_proof_bold_prose_…` and six more; release cases 1–4 |
| MC4 | a CR before the line end is not allowed | `test_a_requirement_written_without_any_source_…` (its CR LF spelling) |
| MC5 | the search for a field line does not stop at a blank line | `test_counter_proof_bold_prose_…` |
| MC6 | the bare name is taken as its own source (so "no date", not "no source") | `test_a_requirement_written_without_any_source_…` |
| MC7 | a blank just inside the asterisks still makes a name | `test_counter_proof_bold_prose_…` |

MC5 was first green: the counter-proof's bold lines stopped the search before the blank line mattered. The case was given a
bold line followed by a blank line and a paragraph with an `*Occasion:*` line; MC5 is red since. MC7 was found by
`tests/release-sprint-02-d-traceability.test.mjs` ("the graph of this repository's commit"), which read the queue entry
`docs/spec-freigaben/2026-09-23_agent-m-v1/07-laufzeiten.md` line 18, `**THE LOCAL BRIDGE BINDS CAN BE TUNNELED OR FORWARDED TO
ALLOW REMOTE WORK **`, as a name ending in a blank; the counter-proof case was added for it.

## The same names on real texts

`scratchpad/itm127c1-developer-opus-c/compare.txt` (not committed) compares `parseRequirements` before (`84ad7be`) and after
the fix, field by field, on 619 Markdown texts: Agent M's `SPEC.md`, every file under `docs/spec-freigaben/` and
`tests/fixtures/`, and, in the process repository, `SOFTWARE_MAINTENANCE.md`, `CLAUDE.md`, two product SPECs checked out there and their
queues under `docs/spec-freigaben/`. No test opens Agent M's `SPEC.md`; this comparison is a
measurement, run once.

- 615 texts give the same map. Agent M's `SPEC.md`: 333 requirements before and after, every field equal.
- 4 texts give more, nothing less and no changed field — four queue entries of `2026-09-23_agent-m-v1` whose requirements were
  written without a source (`03-anforderungsquellen.md`: 3, `04-anforderungen.md`: 6, `07-laufzeiten.md`: 1,
  `09-versionierung.md`: 1). They are exactly finding C1 in real text: each is now read and its missing source named.

## Readings

1. "A bold name in capitals that is followed, before the next blank line or heading, by an `*Occasion:*` or `*Check:*` line"
   (ITM-127, *Back from Release testing*) is read with the name **alone on its line**: a bold label with text after it stays
   prose, even with a `*Check:*` line under it. A name line with a source written without its asterisks
   (`**NAME** (PO, 2026-10-02)`) is therefore not read either; the finding did not ask for it.
2. A bold line also ends the search for a field line, as a blank line and a heading do.
3. `identity.mjs` `identifiers` keeps its own `HEAD` for the names of `SPEC.md`; a requirement without a source is not among
   its items. Not asked by the finding; the format check reads the requirement through `parseRequirements`.
