# One write path that takes an authority — red first, then green, and the counter-proofs

**MESSUNG** — 2026-10-01, branch `team/ITM-008` (from `sprint/01` at `14ceddb`), macOS 26.6.2, Node 25.9, Python 3.14.6.
ITM-008 (implementation job): the git host's write path (`commitFiles`, `commitFilesGitLab`, `writeFiles`) takes an
`authority` and refuses a write without one (ARC-003 decision 3); the dashboard makes the `click` authority from a trusted
event only (`clickAuthority` in `docs/assets/dashboard/writes.mjs`), and the five writes hand it over instead of the click
event. This file records the red first commit, the green implementation, and that every new or changed check fails on a
planted fault (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. Red first, then green

**Method.** `node --test tests/*.test.mjs` and `cd tests && python3 -m unittest` on `14ceddb` (before), on `17478c0` (tests
only) and on `d9b0418` (the implementation).

| Commit | Node | Python |
|---|---|---|
| `14ceddb` (`sprint/01`) | 171 tests, 171 pass | 172 tests, OK |
| `17478c0` (tests only) | 179 tests, 141 pass, 38 fail | 172 tests, 1 failure (`test_settings_page…test_the_store_has_no_product_setting`) |
| `d9b0418` (implementation) | 179 tests, 179 pass | 172 tests, OK |

In CI the run of `17478c0` (pull request #37, run 36898144792; the push ran as 36898128172) is red at its first step: the
Python checks end with that one failure, so the node step does not run there; the node counts above are local.
The 38 red node tests on `17478c0` fail because the write path still asks for a `click` and knows no `authority`, and
because `clickAuthority`, `requireAuthority` and `request` do not exist yet; the eight new tests are among them. The new
repository check (*only the CI entry makes a ci-secret authority …*) is red there only on its known positive — the dashboard
does not make a click authority yet.

## 2. Counter-proofs

**Method.** A script (not committed, in the session's scratchpad) planted one fault at a time, ran
`node --test tests/*.test.mjs` — and `python3 -m unittest` where the table says so —, read the failing tests from node's
`✖` lines and unittest's `FAIL`/`ERROR` lines, and restored the file. It refused a replacement that did not occur exactly
once, and compared the SHA-256 of each file after the restore. Both suites were green before the series and after it.

| Planted fault | File | Red |
|---|---|---|
| `requireAuthority` accepts anything | `git-host.mjs` | 9 tests, among them "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the write path refuses a write without an authority: no request at all", "the authority is one value of one shape …", "the request helper writes only on an authority …", "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no authority …", "… each of the five writes hands the authority to the write path; without one, none writes", "UC-001 5b …" |
| `requireAuthority` accepts an authority with further fields | `git-host.mjs` | "the authority is one value of one shape — { kind } of three kinds; anything else is refused" |
| `requireAuthority` refuses every authority (Node and Python) | `git-host.mjs` | 37 node tests — every check that writes with an authority, among them "each kind of authority writes one commit with the token it is given …", the two changed rate-limit checks "A USED-UP RATE LIMIT IS NAMED — a refused write carries the server's headers too" and "… a GitLab product's 429 is its limit …", and the four app-harness checks of `review-page.test.mjs` that accept —; Python `test_settings_page.ProductSettingsInTheRepository.test_the_store_has_no_product_setting` |
| `commitFiles` without its authority check (its first `GET` goes out) | `git-host.mjs` | 5 tests, among them "… the write path refuses a write without an authority: no request at all" and "… each of the five writes …; without one, none writes" |
| `commitFilesGitLab` without its authority check | `git-host.mjs` | "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no authority: nothing is sent; the route is the token step" |
| the request helper sends a write without an authority | `git-host.mjs` | "the request helper writes only on an authority and builds the header itself — a read needs none" |
| `fetchText` no longer read-only | `git-host.mjs` | "fetchText reads with GET only …", "the request helper writes only on an authority …", "A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else" |
| `clickAuthority` takes any truthy `isTrusted` | `dashboard/writes.mjs` | "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a trusted click becomes a click authority; anything else becomes none" |
| `clickAuthority` returns an authority that can be changed | `dashboard/writes.mjs` | the same test |
| `clickAuthority` makes an authority from an untrusted click | `dashboard/writes.mjs` | the same test; "UC-001 5b …"; the app harness's "counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing" |
| `addProduct` supplies a click authority of its own when none is given | `dashboard/writes.mjs` | "UC-001 5b: a product with the complete layout is only added to the list; no click, nothing at all" |
| `savePseudonymisation` hands no authority on (Node and Python) | `dashboard/writes.mjs` | "… each of the five writes hands the authority to the write path …", "A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice"; Python `test_the_store_has_no_product_setting` |
| the settings view hands the event, not the authority, to `saveCollaborators` | `dashboard/settings-view.mjs` | "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — every write a view starts hands over the click authority made from its button's event" |
| the review view makes the authority itself instead of from the click | `dashboard/review-views.mjs` | the same test; the app harness's "counter-proof: the write happens only on a trusted click …" |
| the add-product view hands no authority | `dashboard/add-product-view.mjs` | "… every write a view starts hands over the click authority made from its button's event" |
| a `ci-secret` authority made in the kernel | `review-core.mjs` | "A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT USES THE PERSON'S OWN LOGIN — only the CI entry makes a ci-secret authority, only the bridge app an agent-login one, only the dashboard a click" |
| the `agent-login` kind named in the settings store | `settings-store.mjs` | the same test |
| a `click` authority made in the git host | `git-host.mjs` | the same test |

The repository check and the view check also check themselves: each shows on constructed texts that a kind made outside its
shell, a kind named as a string outside its shell and the git host, the click event handed over, a missing authority and an
authority not made from a click are caught, and that a shell making its own kind, the git host listing the kinds, prose
between backticks and the event name `"click"` are not.

## 3. What the suites do not see

- **An authority's kind is checked, not where the value came from.** `requireAuthority` accepts any object `{ kind }` of the
  three kinds; that only a runtime's shell makes one is a repository check over the code's text (an object whose `kind` is
  one of the three, and the strings `"ci-secret"` and `"agent-login"`). A value assembled at run time — `{ kind: k }` with
  `k` read from elsewhere — is not caught by it.
- **`addProduct` reads before the write path refuses.** Without its own `isTrusted` check (dropped as ITM-008 says),
  `addProduct` called without an authority reads the product's repository information and tree, then the write path refuses
  the layout's commit: nothing is written and nothing stored, but two `GET` requests were sent. On the page no such call
  starts: the click handler makes the authority first, and a click a script makes becomes none. If the layout is complete,
  `addProduct` without an authority writes nothing and stores the address in the browser — no repository write happens.
- **The settings page's Save buttons are still not clicked by an app-harness test** (recorded by ITM-124). The new view check
  reads that every write call of the views hands over `clickAuthority(<the handler's event>)`; it does not run the handler.
