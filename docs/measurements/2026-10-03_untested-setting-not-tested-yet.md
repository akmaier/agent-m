# An untested browser setting reads "not tested yet" — the red first commit and three planted faults

**MESSUNG** — 2026-10-03, branch `team/ITM-160` (from `sprint/03` at `fc61996`), developer-opus-a (claude-opus-5-5), macOS 26.6,
Node 25.9, Python 3.14. ITM-160 (implementation job, MOD-dashboard-app): since ITM-136 a setting's last test is kept across
reloads, so the untested state "stored — not tested on this page yet" said something no longer true. Soll: "stored — not tested
yet" for a token's line, "not tested yet" for a remote session's line.

## 1. The path, before and after

Settings page → `dashboard/settings-view.mjs` `browserSettingsHtml({ entries, shown, now })` → the state of each line, read from
the last test kept beside the setting (`tokenTest`, a GitLab entry's `tested`, `sessionTest`) → `<p class="state">` /
`<span class="state">`. When nothing is kept, three expressions produce the untested sentence:

| Line | Where | Before | After |
|---|---|---|---|
| GitHub token | `tokenStateLine`, last `return` | `stored — not tested on this page yet` | `stored — not tested yet` |
| GitLab project token | the `state` of each `gitlab-token` line | `stored — not tested on this page yet` | `stored — not tested yet` |
| Remote session | the `state` of each `remote-session` line | `not tested on this page yet` | `not tested yet` |

The item names the sentence "twice" (the token lines and the remote session's line); the token lines are two expressions, so the
code holds it three times. No other code file writes it.

## 2. The sentence grep (before the first commit)

`grep -rn "on this page yet"` over `tests/`, `docs/assets/`, `tools/`, and a whitespace-normalised count per file (a phrase split
over a line break, or written with `\s` in a regex, would be counted too): `tests/dashboard-settings-last-test.test.mjs` **7**,
`tests/test_settings_page.py` 1, `tests/dashboard-review-flows.test.mjs` 1, `docs/assets/dashboard/settings-view.mjs` 3. The grep is
known to hit (the code's three). The item says eight places in `dashboard-settings-last-test.test.mjs`; there are seven (lines 86,
132, 134, 147, 182, 206, 276). The remote session's untested line is asserted nowhere. No release test and no other file asserts
the sentence (two mentions in the frozen copy `tests/fixtures/sprint-02-running/docs/backlog/ITM-136-…md` are fixture text, not
an assertion, and stay).

## 3. The tests

Changed expectations (old → new), each the one sentence:

| File | Line | Case | Old | New |
|---|---|---|---|---|
| `tests/dashboard-settings-last-test.test.mjs` | 86 | a successful Test … shown after a reload ("before any test") | `stored — not tested on this page yet` | `stored — not tested yet` |
| same | 132 | a new token stored with Change starts untested | same | same |
| same | 134 | same case, "after the reload too" | same | same |
| same | 147 | Clear removes the kept date … ("the same token stored again starts untested") | same | same |
| same | 182 | a GitLab project token's last test … (before the Test) | same | same |
| same | 206 | a GitLab project token changed or cleared … ("the new value starts untested") | same | same |
| same | 276 | an import that keeps this browser's own token … ("with its own state") | same | same |
| `tests/test_settings_page.py` | 87 | `test_the_last_test_is_read_from_the_browser` (counter-proof without a kept test) | same | same |
| `tests/dashboard-review-flows.test.mjs` | 800 | UC-042 step 1: one page — each browser setting is a line with its state … | same | same |

New case in `tests/dashboard-settings-last-test.test.mjs` (its header's `Module`, `Guards`, `Level` apply): **S1** "UC-042 step 1: a
remote session never tested reads "not tested yet"" — a jump host and one session stored, no Test: the session's line is
`<span class="state">not tested yet</span>`, and after a reload too.

## 4. Red first

Commit `d0963ed` (tests only; the code of `sprint/03` at `fc61996`). Local, on a clean tree: `node --test tests/*.test.mjs` — 503
tests, 486 pass, **8 fail**, 9 todo (the seven cases above that assert the sentence in the two JS files, and S1);
`cd tests && python3 -m unittest` — 366 tests, **3 failures** (`test_the_last_test_is_read_from_the_browser`, and the two cases of
`test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec`, which run both suites nested and fail because those are red), 5 expected
failures. CI on pull request #75: runs `37115723108` (push) and `37115730154` (pull request) — **failure**, both on the commit
`d0963ed`, the same three Python failures (the Node step did not run after the failed Python step). Not rerun.

Before the item, on `fc61996`: 502 tests (493 pass, 0 fail, 9 todo) and 366 tests, OK (5 expected failures).

## 5. Counter-proofs — each fault planted alone on the green tree, the changed tests run, the fault removed

Script `scratchpad/itm160-developer-opus-a/mutate.txt` in the session scratchpad (not committed): one line of `settings-view.mjs`
replaced, `node --test tests/dashboard-settings-last-test.test.mjs tests/dashboard-review-flows.test.mjs` and
`python3 -m unittest test_settings_page` run, the file restored.

| Fault | Red |
|---|---|
| M1 the GitHub token's line says "on this page" again (`tokenStateLine`) | 5 JS cases — lines 86, 132/134, 147, 276 of the last-test file and the one-page case of the review flows — and `test_the_last_test_is_read_from_the_browser` |
| M2 a GitLab project token's line says it again | the two GitLab cases (lines 182, 206) |
| M3 a remote session's line says it again | S1 |

Every changed expectation and the new case is red on at least one fault; after the script `git status` showed a clean tree.

## 6. Green

The implementation commit `607958f`, on a clean tree: `node --test tests/*.test.mjs` — 503 tests, 494 pass, 0 fail, 9 todo;
`cd tests && python3 -m unittest` — 366 tests, OK (5 expected failures).
