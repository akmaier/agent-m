# A browser setting's line keeps its last test across reloads — the red first commit and twelve planted faults

**MESSUNG** — 2026-10-01, branch `team/ITM-136` (from `sprint/02` at `942c813`), macOS 26.6, Node 25.9, Python 3.14.
ITM-136 (implementation job, MOD-settings-store and MOD-dashboard-app): UC-042 step 1 — each browser setting's line shows
✓ *works* with the date of the last successful test, or ✗ *refused* when the server refused it at the last use — also after a
reload. Finding of ITM-123 (`2026-10-01_built-flows-characterised.md`, section 3): both were kept for the page only
(`tokenState` in memory); after a reload a token showed "stored — not tested on this page yet".

## 1. The path, before and after

*Test* on the settings page → `dashboard/settings-view.mjs` `renderBrowserSettings`, the `[data-test="agent-m.github-token"]`
handler → `git-host.mjs` `repositoryInfo` with the token → on success the state is written, on a 401 `dashboard-app.mjs`
`noteRefusal` marks the token refused → `renderBrowserSettings` → `browserSettingsHtml` → `tokenStateLine` → `<p class="state">`.

- **Before:** the state was `tokenState = { ok, refused, gitlab: {}, sessions: {} }`, a constant of `dashboard-app.mjs`, handed
  to every view in `app` and read and set in four files (`dashboard-app.mjs`, `settings-view.mjs`, `setup-view.mjs`,
  `add-product-view.mjs`). A reload imports the app afresh: `tokenState` started empty, and the line said "stored — not
  tested on this page yet".
- **After:** `tokenState` is gone. The last test is kept by MOD-settings-store beside the setting it describes: the GitHub
  token's in the key `agent-m.github-token-tested` beside the token and its expiry date (`{"ok":"YYYY-MM-DD"}` or
  `{"refused":true}`); a GitLab project token's as `tested` in its entry of `agent-m.gitlab-tokens`; a remote session's as
  `tested` (`{"up":"YYYY-MM-DD"}` or `{"down":true}`) in its entry of `agent-m.remote-sessions`. New store calls:
  `getTokenTest`, `setTokenTest`, `setGitLabTokenTest`, `setRemoteSessionTest`; `tokenTest` and `sessionTest` read a kept
  value and drop anything malformed. `browserSettingsHtml({ entries, shown, now })` reads the state from the entries — it
  takes no `tokenState` any more —, and the line at the top of every view reads the GitHub token's and the shown GitLab
  product's kept refusal (`showBanner`, `route`).
- **A new value starts untested:** `setToken` and `setGitLabToken` drop the old test, as `setToken` already dropped an old
  expiry date (the four in-memory resets — *Store token*, *Store and check*, a GitLab *Change*, the add-product *Store and
  check* — are now the store's).
- **A CLEAR IS A REAL CLEAR:** `clearToken` removes the key; `clearGitLabToken`, `removeProduct`, `clearRemoteSession` remove
  the entry that holds it; *Clear everything* removes every `agent-m.` key.
- **EVERY SETTING IS REACHED FROM ONE PAGE:** the new key has its place, `data-setting-key="agent-m.github-token-tested"`, on
  the GitHub token's line (the paragraph of *Test*, *Change*, *Clear*), and the line's *What is this?* says that the answer is
  kept beside the token and removed with it. It is in `settingKeys` (`partOf` the token) and in `KEYS`, so an export carries
  it; an import that adds the token brings the file's last test, one that keeps this browser's token keeps this browser's
  (`mergeSettings`, as for the expiry date). GitLab and session entries carry theirs inside the entry.
- **What clears a kept refusal:** a successful *Test*, a new value, or a *Clear* — as within one page before. A later
  successful request with the same token that is not a *Test* does not clear it (it did not within a page either).

## 2. The tests

`tests/dashboard-settings-last-test.test.mjs` (new) — `Module: MOD-dashboard-app`, `Guards: A BROWSER SETTING IS TESTED AND
CLEARED WHERE IT IS SHOWN; EVERY SETTING IS REACHED FROM ONE PAGE; A CLEAR IS A REAL CLEAR; SETTINGS ARE EXPORTED AND IMPORTED
WITH THEIR SECRETS; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; UC-042`, `Level: component`. The real dashboard runs in
`tests/app-harness.mjs`; a reload is a new page load (the app imported afresh, nothing in memory) on the same browser storage.

| Test | Expected |
|---|---|
| L1 | GitHub token: *Test* succeeds; after a reload the line is `✓ works — tested <today>` |
| L2 | GitHub refuses the token (401 to every request with it); after a reload the line is `✗ refused — …` and the line at the top names the refused GitHub token with *Renew*, on every page |
| L3 | refused, then a successful *Test*: after a reload `✓ works — tested <today>` and no line at the top |
| L4 | *Test* succeeds, then *Change* stores a new token: the line is "stored — not tested on this page yet", after a reload too |
| L5 | *Test* succeeds, then *Clear*: no `agent-m.` entry is left; the same token stored again starts untested |
| L6 | *Clear everything* after a GitHub and a GitLab *Test*: no `agent-m.` entry is left |
| L7 | after a GitHub, a GitLab and a session *Test* and a reload, every `agent-m.` key in localStorage has its `data-setting-key` on the page |
| L8 | GitLab project token: works, reload → `✓ works — tested <today>`; refused, reload → `✗ refused — gitlab.example.org …` |
| L9 | GitLab project token: a new value starts untested after a reload; *Clear* leaves no date of a test and no line |
| L10 | remote session: something answers, reload → `✓ something answered … — tested <today>`; nothing answers, reload → `✗ nothing answered …`; *Clear* removes it |
| L11 | export after a *Test* holds the date; imported into an empty browser, the line is `✓ works — tested <today>` |
| L12 | an import that keeps this browser's own token keeps its own state ("not tested"), not the file's |

`tests/test_settings_page.py` (MOD-dashboard-app) gains `test_the_last_test_is_read_from_the_browser` (P1): a kept
`{"ok":"2026-09-29"}` shows `✓ works — tested 2026-09-29`, a kept `{"refused":true}` shows `✗ refused — …`; counter-proof
without one: "stored — not tested on this page yet". Its existing check `test_every_key_the_store_writes_has_a_place_on_the_page`
finds the new key `agent-m.github-token-tested` on the page.

### Changed tests (same modules)

- `tests/test_settings_page.py`: `page()` passes no `tokenState` — the state is among the entries now; `gitlab_entries()` takes
  `tested`, and `test_expiry_warned_and_refusal_named` gives the refusal as the entry's `tested: {refused: true}` instead of
  `state={"gitlab": {…: {"refused": True}}}` — its expected result ("refused" on the line) is unchanged.
  `test_the_store_writes_no_key_but_its_named_ones` allows the store's new named constant `TOKEN_TEST_KEY` beside the six it
  allowed — the property it guards (no key written but a named one) is unchanged.
- `tests/app-harness.mjs` (test support, names no module): a control found by an attribute selector answers `getAttribute` from
  its tag, as a browser element does. `settings-view.mjs` finds a remote session's result line with `getAttribute`
  (`wireRemoteSettings`, `one`); no test had pressed a session's *Test* before L7 and L10, which threw `x.getAttribute is not a
  function` in the harness.
- No expectation of `tests/dashboard-review-flows.test.mjs`, the release tests or `tests/review-core.d/settings-store.test.mjs`
  changed; the release tests' five `{ todo }` marks stay.

## 3. Red first

Commit `2c38285` (tests only; the code of `sprint/02` at `942c813`). Local: `node --test tests/*.test.mjs` — 350 tests, 338
pass, **7 fail**, 5 todo; `cd tests && python3 -m unittest` — 247 tests, **2 failures** (`test_expiry_warned_and_refusal_named`,
`test_the_last_test_is_read_from_the_browser`), 2 expected failures. CI on pull request #57: runs `36928944972` (push) and
`36928964219` (pull request) — **fail**.

The seven red JS tests: L1, L3, L5, L7, L8, L10, L11. Today's dashboard after the reload, in L1: actual `stored — not tested on
this page yet`, expected `✓ works — tested 2026-10-01` — the counter-proof the item names. L7 and L10 were red in that commit
also for the harness's missing `getAttribute` (above); with the branch's harness and the code of `942c813`, L7 is green and L10
red (actual `not tested on this page yet` after the reload), and L1, L3, L5, L8, L11 stay red. L2, L4, L6, L9 and L12 were green
on the code of `942c813`: within a page they hold already (L2: a refused token is refused again by the reload's own requests);
each is shown red below on a fault of its own.

## 4. Counter-proofs — each fault planted alone, the new tests run, the fault removed

| Fault | File | Red |
|---|---|---|
| M1 the line ignores the kept test (`tested = null`) | `settings-view.mjs` | L1, L2, L3, L11; P1 |
| M2 a new token keeps the old token's test (`setToken` keeps the key) | `settings-store.mjs` | L4 |
| M3 *Clear* leaves the token's test (`clearToken` keeps the key) | `settings-store.mjs` | L5 |
| M4 *Clear everything* skips the key | `settings-store.mjs` | L6 |
| M5 the key has no `data-setting-key` on the page | `settings-view.mjs` | L7; `test_every_key_the_store_writes_has_a_place_on_the_page`, `test_counter_proof_a_key_without_a_place_fails` |
| M6 a GitLab entry's `tested` is dropped when the map is read | `settings-store.mjs` | L8; `test_expiry_warned_and_refusal_named` |
| M7 a new GitLab value keeps the old value's `tested` | `settings-store.mjs` | L9 |
| M8 a session's test is not kept | `settings-store.mjs` | L10 |
| M9 an import that adds the token leaves the file's test behind | `settings-store.mjs` | L11 |
| M10 an import puts the file's test beside this browser's own token | `settings-store.mjs` | L12 |
| M11 a refusal of the GitHub token is not kept (`noteRefusal`) | `dashboard-app.mjs` | L2 |
| M12 a successful *Test* is not kept | `settings-view.mjs` | L1, L3, L5, L11 |

Every new test is red on at least one fault; the tree was restored after each (`git status` shows only the change of this item).

## 5. Green

The implementation commit: `node --test tests/*.test.mjs` — 350 tests, 345 pass, 0 fail, 5 todo; `python3 -m unittest` — 247
tests, OK (2 expected failures). Before the item, on `942c813`: 338 tests (333 pass, 5 todo) and 246 tests, OK (2 expected
failures).
