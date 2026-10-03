# The blank lines that end an approved proposal — counter-proofs (ITM-159)

**MESSUNG** — 2026-10-03, branch `team/ITM-159` (on `sprint/03` at `b8896c6`), macOS, Node 25.9.0, Python 3.14.6.
developer-opus-c (claude-opus-5-5).

ITM-159 settles finding **V1** of ITM-014 as the Product Owner's reading (sprint 03 planning, 2026-10-02): the blank lines
that end an approved proposal are the separator, not its text. The case
`tests/test_verbatim.py::Verbatim::test_blank_lines_at_the_end_of_a_proposal_are_written` now asserts that reading and its
`@unittest.expectedFailure` mark is gone. No code file changes: `docs/assets/review-core.mjs` and `tools/apply_approvals.py`
are byte-identical to `b8896c6`.

## The changed expectation

| | before (`b8896c6`) | after |
|---|---|---|
| input | `VARIANTS["a tab"] + "\n"` — a proposal ending in one blank line | a proposal with two trailing spaces (a Markdown line break), a line that ends the text before a blank line and a second paragraph, ending in one blank line and — a second subtest — in two |
| expected SPEC | `outside(spec, proposal)` — the proposal byte for byte, its final blank line included | `outside(spec, content + "\n")` — the content byte for byte and one line break at the section's end, on both writers |
| mark | `@unittest.expectedFailure` (FINDING V1) | none |

## Suites

| | start (`b8896c6`) | after |
|---|---|---|
| `cd tests && python3 -m unittest` | 367, OK (5 expected failures) | 367, OK (4 expected failures) |
| `node --test tests/*.test.mjs` | 535 tests — 531 pass, 4 todo | 535 tests — 531 pass, 4 todo (no node file changed) |

## Counter-proofs

Each fault was planted in a scratch copy of the worktree (outside it), in one writer at a time, the case was run, and the
file was restored (byte-identical to the worktree's afterwards). Both subtests (one and two trailing blank lines) were red
under every fault; with the faults removed the case is green.

| Planted fault | Where | Case |
|---|---|---|
| D1 — the trailing blank lines are kept (`proposal.replace(/\n$/, "")`) | `replaceSection` | red, both subtests (dashboard) |
| W1 — the trailing blank lines are kept (`prop.removesuffix("\n")`) | `apply_approvals.py` | red, both subtests (workflow) |
| D2 — a blank line inside the content is dropped (`.replace(/\n\n+/g, "\n")`) | `replaceSection` | red, both subtests |
| W2 — a blank line inside the content is dropped (empty lines filtered) | `apply_approvals.py` | red, both subtests |
| D3 — the two trailing spaces of a Markdown line break are dropped (`trimEnd()` per line) | `replaceSection` | red, both subtests |
| W3 — the two trailing spaces of a Markdown line break are dropped (`rstrip(" ")` per line) | `apply_approvals.py` | red, both subtests |
| none — restored | — | green |

## Observation

In the fixture `tests/fixtures/gates/`, the section `## 2. More` runs up to and including the blank line before
`## 3. Last`; both writers replace that blank line with the proposal, so the written SPEC holds `…after it.\n## 3. Last` —
one line break, no blank line before the next heading. This is the behaviour the byte-for-byte case of ITM-014
(`test_both_writers_write_the_approved_text_byte_for_byte`) already pins, unchanged here.
