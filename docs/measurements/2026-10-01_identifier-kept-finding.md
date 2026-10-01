# identifierKept returns a finding — the red first commit and the counter-proofs

**MESSUNG** — 2026-10-01, branch `team/ITM-126` (from `sprint/02` at `ef4f619`), macOS, Node 25, Python 3.14. ITM-126
(implementation job, modules MOD-artifacts and MOD-dashboard-app): `identifierKept(openedId, text)` in
`docs/assets/artifacts.mjs` returns `null` or a finding `{ artifact, line, kind, what, rule, fix }` instead of a sentence;
`formatChecks` (`docs/assets/artifacts/checks.mjs`) takes that finding as it comes; `saveReviewedFile`
(`docs/assets/dashboard/writes.mjs`) writes the sentence a person reads from it. This file records the red first commit and
the counter-proof of the changed test (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`f726647` holds only the changed test in `tests/review-core.d/artifacts.test.mjs` (“AN EDITED FILE KEEPS ITS IDENTIFIER — a
use case whose text carries another identifier, or none, is refused with a finding”): it expects the finding — its rule, the
line of the `id` (2 in the fixture, the moved line further down, 1 without an `id`), what is wrong and the fix — and `null`
for the same identifier. Locally on that commit: Python ran 172 tests, OK; Node ran 244 tests, 243 passed and 1 failed — that
test, because `identifierKept` still returned the sentence. In CI, both runs of pull request #40 on that commit failed in the
step *Dashboard core* after *Python checks* passed (runs 36915309802, push, and 36915328251, pull request).

## 2. Counter-proofs

**Method.** A script (not committed) planted one fault at a time by replacing one exact string in one file, ran
`node --test tests/*.test.mjs` and `cd tests && python3 -m unittest`, read the failing tests from node's `✖` lines, and
restored the file. Both suites were green before the series and after it (Node 244/244, Python 172 OK); `git status` showed
no change to a tracked file afterwards. Python stayed green under every fault: no Python test reads these functions.

Every row is red.

| Planted fault | File | Red (node) |
|---|---|---|
| M1 the sentence again: `identifierKept` returns the old refusal text | `docs/assets/artifacts.mjs` | “AN EDITED FILE KEEPS ITS IDENTIFIER — … refused with a finding”; “a use case: the identifier it was opened with is kept …”; “a decision: each broken part …”; “a module: each broken interface …”; “A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape …”; “UC-008 3a: an edit that changes the identifier is refused …” |
| M2 the line of the `id` lost: always line 1 | `docs/assets/artifacts.mjs` | “AN EDITED FILE KEEPS ITS IDENTIFIER — … refused with a finding”; “a use case: …”; “a decision: …”; “a module: …” |
| M3 the rule named wrongly (`THE NAME IS THE ID AND IT SURVIVES`) | `docs/assets/artifacts.mjs` | “AN EDITED FILE KEEPS ITS IDENTIFIER — … refused with a finding”; “a use case: …”; “a decision: …”; “a module: …” |
| M4 the fix left out | `docs/assets/artifacts.mjs` | “AN EDITED FILE KEEPS ITS IDENTIFIER — … refused with a finding”; “A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape …” |
| M5 a kept identifier refused too | `docs/assets/artifacts.mjs` | “AN EDITED FILE KEEPS ITS IDENTIFIER — … refused with a finding”; “a complete artifact of every kind yields no finding”; “UC-008 3a: Edit opens the editor …”; “UC-008 3a: a save is refused when the file changed …”; “THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — each of the five writes …”; “AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD” |
| M6 a changed identifier passes | `docs/assets/artifacts.mjs` | “AN EDITED FILE KEEPS ITS IDENTIFIER — … refused with a finding”; “a use case: …”; “a decision: …”; “a module: …”; “UC-008 3a: an edit that changes the identifier is refused …”; “AN EDITED FILE KEEPS ITS IDENTIFIER · … — ARC and MOD” |
| M7 the dashboard's sentence without the identifier the file was opened with | `docs/assets/dashboard/writes.mjs` | “UC-008 3a: an edit that changes the identifier is refused …” |
| M8 the dashboard saves despite the finding | `docs/assets/dashboard/writes.mjs` | “UC-008 3a: an edit that changes the identifier is refused …”; “AN EDITED FILE KEEPS ITS IDENTIFIER · … — ARC and MOD” |
| M9 `formatChecks` drops `identifierKept`'s finding | `docs/assets/artifacts/checks.mjs` | “a use case: …”; “a decision: …”; “a module: …” |

M1 to M6 are the faults the changed test guards against; it is red on each of them.

## 3. The sentence a person reads is unchanged

A script (not committed) compared, for five texts — another identifier, no `id` line, an empty `id:`, a module's identifier,
no front matter —, the sentence `identifierKept` returned at `ef4f619` with the message `saveReviewedFile` refuses with now.
All five are byte-identical, for example: “The file was opened as UC-002, but the text now carries the identifier UC-099 — an
edited file keeps its identifier. Nothing was saved; put the identifier back, or propose a new file for a new one.” The
app-harness check “UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in
the editor” is green with its expectation unchanged.
