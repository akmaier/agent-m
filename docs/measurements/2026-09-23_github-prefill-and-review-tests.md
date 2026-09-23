# GitHub new-file prefill, and the counter-proof of the review tests

**MESSUNG** — 2026-09-23, Chrome on macOS, repository `akmaier/agent-m`. Nothing was committed
during the measurement; both editor tabs were closed without saving.

## 1. Does GitHub's new-file page accept a prefilled path and text?

The feature (`/new/<ref>?filename=…&value=…`) is not documented by GitHub; an issue reports quirks
with `filename` plus a folder path (isaacs/github#1527). The design of SPEC §10 depends on it, so
it was measured before building on it.

| Case | Browser state | Result |
|---|---|---|
| `filename=docs/approvals/PREFILL-TEST-UC-005-0123456789ab.md`, 3-line record (~120 B) | logged in | ✓ Breadcrumb `agent-m / docs / approvals /`, filename field `PREFILL-TEST-UC-005-0123456789ab.md`, editor lines exactly the record plus the final empty line |
| 5 588-byte Markdown text (URL 5 926 chars) | logged in | ✓ text arrives |
| same 5 588-byte text | **logged out** | ✗ redirect to `/login?return_to=<whole URL, encoded twice>` → **HTTP 500** "Whoops, something went wrong!" |

**Consequence:** the approval link carries only the short record (path and SHAs); edited text
goes through GitHub's web editor. SPEC §10 `NO TEXT TRAVELS IN A URL`. The dashboard also shows
the record with a copy button, in case the prefill ever stops arriving.

## 2. Counter-proof of the new checks (SOFTWARE_MAINTENANCE §4.0a rule 5)

Each mutation was applied to the implementation, the full suite was run, the file restored.

| Mutation | Suite |
|---|---|
| blob header `blob N\0` → `blob N ` | red |
| use-case status ignores the file path | red |
| origin check in `fetchText` removed | red |
| GET-only check removed | red |
| URL-length limit removed | red |
| code-fence masking in `extractSection` removed | red |
| SPEC status ignores the section SHA | red |
| applier: section SHA check removed | red |
| applier: proposal SHA check removed | red |
| applier: anchor check removed | red |
| applier: trailing-newline preservation removed | red |
| applier: idempotence check removed | red |
| direct `fetch(` added to the app | red |
| `localStorage` added to the app | red |
| CDN `<script>` added to `index.html` | red |

After restoring: suite green (17 Python, 11 node).

## 3. A defect found on the way

Replacing the **last** section of a file drops the file's final newline: the section includes the
empty string after the last `\n`. `tools/apply_approvals.py` preserves it (test
`test_approved_proposal_is_written_verbatim`). `scripts/spec_dashboard.py` in the process
repository has the same logic and does drop it: `SPEC.md` ended with `\n` as a skeleton (commit
`687a6bc`) and has not since the approvals of 2026-09-23. Harmless for rendering; reported, not
fixed here, because the tool belongs to the process repository.

## 4. End to end: a record built by the browser, applied by the workflow

The dashboard, served locally and reading `feature/review-dashboard` at `aa029a2`, built the
approval record for queue `2026-09-23c_review-auf-github` entry 01 (proposal blob `571d11a…`,
section blob `916c0fa…`). The same record was committed in a throwaway worktree of that branch and
`tools/apply_approvals.py` was run.

- The browser's blob SHA for `UC-008` equals `git rev-parse <branch>:<file>` (`22c8cde…`).
- **First attempt: crash.** `docs/approvals/README.md` shows example records in code blocks; the
  applier read it as a record and died with a traceback on the missing `<queue>/index.md`. The
  unit tests had not covered it. Fixed: the README is skipped (as the dashboard and the record
  test already did), and a record naming a queue without `index.md` is **refused**, not a crash.
  Both are regression tests now (`test_readme_with_example_records_is_not_a_record`,
  `test_unknown_queue_is_refused_not_crashed`), both red before the fix.
- **Second attempt:** `applied — SPEC.md ## 9. Human gates`, rc 0; the proposal stands verbatim
  in `SPEC.md` with exactly one `## 10.` heading; one decision line appended; the file ends with a
  newline again; a second run reports `nothing to apply`.

## 5. Correction to §4, same day

§4 states that after the second attempt "the file ends with a newline again". **That is wrong.**
The check printed the file's last byte with `od`, and the output (a backtick) was misread. Measured
again with `open('SPEC.md','rb').read().endswith(b'\n')`: `False` on `main`, and `False` after the
workflow applied entry `c/01`. The "1 deletion" in that diff was the section's last line being
replaced, not a newline being restored.

What is true: both tools now **preserve** a file's form, including a missing final newline.
`tools/apply_approvals.py` did so from the start; `scripts/spec_dashboard.py` does since the fix of
2026-09-23 (process repository, `tests/run_spec_dashboard_tests.py`). Agent M's `SPEC.md` has lacked
its final newline since the first approval round, and neither tool adds one back. Harmless for
rendering; restoring it would be a one-byte SPEC change through the approval queue.
