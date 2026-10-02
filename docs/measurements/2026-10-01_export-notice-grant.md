# The export notice's GitHub grant names pull requests — the new test and its counter-proofs

**MESSUNG** — 2026-10-01, branch `team/ITM-125` (from `sprint/02` at `ef4f619`), macOS 26.6, Node 25.9, Python 3.14.
ITM-125 (implementation job): the grant `settingKeys` gives the GitHub token (`docs/assets/settings-store.mjs`), from which
the export notice is built (`docs/assets/dashboard/settings-view.mjs` `exportNotice`), names every write the one token
carries — commits, issues, pull requests and workflow runs (`AN EXPORT STATES THAT IT CONTAINS SECRETS`, `ONE GITHUB TOKEN
SERVES EVERY FEATURE`). Counter-proof of the new test (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A
PLANTED FAULT`).

## 1. What changed

- New test: `tests/test_settings_disclosure.py` `ExportDisclosure.test_the_github_grant_names_every_write_of_the_one_token` —
  the notice for a stored GitHub token states, between "GitHub token, which" and "to every repository", each of
  `commits`, `issues`, `pull requests`, `workflow runs`.
- Changed expectation (MOD-dashboard-app, allowed by ITM-125 *From the sprint 02 review of ITM-125*):
  `tests/dashboard-review-flows.test.mjs`, test "UC-042 step 6: the export states what it contains and what each secret
  grants; …" — the asserted sentence "…which writes — commits, issues and workflow runs — to every repository…" becomes
  "…which writes — commits, issues, pull requests and workflow runs — to every repository…". Nothing else in the file.
- Code: the grant in `docs/assets/settings-store.mjs` becomes "writes — commits, issues, pull requests and workflow runs —
  to every repository it was given, under your account".

## 2. Suites

| Commit | `cd tests && python3 -m unittest` | `node --test tests/*.test.mjs` |
|---|---|---|
| `ef4f619` (start) | 172, OK | 244, 244 pass |
| `690626c` (tests only) | 173, 1 failure — the new test | 244, 243 pass, 1 fail — UC-042 step 6 export notice |
| grant changed | 173, OK | 244, 244 pass |

## 3. Counter-proofs

Each fault planted in the grant of the GitHub token on the green state, then `python3 -m unittest
test_settings_disclosure.ExportDisclosure` and `node --test tests/dashboard-review-flows.test.mjs`, then the file restored
(byte-compared). Script: `scratchpad/itm125-developer-opus-d/mutate.sh` (not committed).

| Fault | New test | Flows test (UC-042 step 6) |
|---|---|---|
| M1 "pull requests" dropped — the text before this item | red | red (64/65) |
| M2 "issues" dropped | red | red (64/65) |
| M3 "workflow runs" dropped | red | red (64/65) |
| M4 "commits" dropped | red | red (64/65) |
| M5 grant emptied | red (and `test_the_notice_names_each_secret_and_what_it_grants` red) | red (64/65) |

After the last restore the file equals the green state; both suites green as in section 2.
