# A token kept as refused works again after its next successful request — the red first commit and six planted faults

**MESSUNG** — 2026-10-03, branch `team/ITM-161` (from `sprint/03` at `37449fc`), developer-opus-a (claude-opus-5-5), macOS 26.6.2,
Node 25.9, Python 3.14. ITM-161 (implementation job, MOD-dashboard-app and MOD-settings-store): UC-042 step 1 shows a token as
"refused at the last use". Since ITM-136 a kept refusal was cleared only by *Test*, a new value or *Clear*
(`2026-10-01_settings-last-test.md`, section 1: "A later successful request with the same token that is not a *Test* does not
clear it"). Soll, in the Product Owner's reading of the sprint 03 planning: the last use decides.

## 1. The path, before and after

A request of the page with a stored token → `git-host.mjs` `prepare` puts the token into the request's only authorisation header
(`Authorization: Bearer …` to GitHub's API, `PRIVATE-TOKEN` to the GitLab project's API) → the browser's `fetch` → the answer.

- **Refused (unchanged):** a `401` throws in `fetchText` → the caller's `noteRefusal` (`dashboard-app.mjs`) → `tokenRefusal` →
  `store.setTokenTest({ refused: true })` / `store.setGitLabTokenTest(address, { refused: true })` → the line at the top and the
  settings line say "✗ refused".
- **Answered, before:** nothing was noted unless the request was the token's *Test* (`settings-view.mjs`, `{ ok: today() }`). The
  defect, reproduced on `37449fc`: refused at a read of the architecture view, the same read answered a moment later → the kept
  value stays `{"refused":true}`, the line at the top still says "GitHub refused your GitHub token".
- **Answered, after:** `dashboard-app.mjs` `start()` wraps the browser's `fetch` once, before the page's first request
  (`watchAnswers`). For every answer with a 2xx status it reads the token the request carried (`sentToken`: `Authorization:
  Bearer`, else `PRIVATE-TOKEN`) and calls the new store method `tokenAnswered(token, today())` (`settings-store.mjs`); where that
  replaced a refusal, the line at the top is redrawn (`showBanner`) and, if shown, the settings page's browser section
  (`renderBrowserSettings`) — as `noteRefusal` does for a refusal.
- **`tokenAnswered(token, day)`:** a kept refusal of that token — the GitHub token, or a GitLab project token stored under any
  address — becomes `{ ok: day }`, the value a successful *Test* writes. A token not tested yet, a token kept as working, and every
  other token are left as they are. Returns whether a refusal was replaced.

## 2. Readings made

1. **"answered" = a 2xx answer**, the outcome that makes a *Test* write `{ ok }` (`repositoryInfo` returned). A `403` or `404` for a
   missing permission or repository is not a success; a `401` is the refusal itself, noted where the request was made.
2. **A used-up rate limit is neutral** — neither a refusal nor a success. `usedUpLimit` (MOD-git-host) and `A USED-UP RATE LIMIT IS
   NAMED, NOT BLAMED ON THE TOKEN` say such a `403`/`429` says nothing about the token; `tokenRefusal` already ignores it, and a
   non-2xx answer is never counted as a success here, so the kept state stays whatever it was.
3. **Only a kept refusal is replaced.** The item's outcome: "a successful request with a stored token replaces its kept refusal by
   ✓ works". A token "stored — not tested yet" stays so after the page's own successful reads (the existing case "before any test"
   of `dashboard-settings-last-test.test.mjs` holds: the settings page reads the instance with the token before that assertion),
   and a kept "✓ works — tested <date>" keeps its date. Planted fault F6 below shows the existing cases that guard this.
4. **The seam is the browser's `fetch`.** Every module's request goes through it (MOD-git-host calls `fetch` directly and offers no
   answer hook); MOD-dashboard-app's architecture names `fetch` and the browser's storage as its seams. The item's modules are
   MOD-dashboard-app and MOD-settings-store, so the watcher sits in the composition root and reads only the request's own headers
   and the answer's status — never its body, and it never changes the request or the answer.

## 3. The tests

`tests/dashboard-settings-last-test.test.mjs` (its header's `Module: MOD-dashboard-app`, `Guards: … A BROWSER SETTING IS TESTED
AND CLEARED WHERE IT IS SHOWN … UC-042`, `Level: component` apply; the header now names this file for the section's counter-proofs).
`instanceWorld` takes extra repository files and a switch `limitGitHub`: GitHub answers a request with the stored token `403` with
`X-RateLimit-Limit: 5000`, `X-RateLimit-Remaining: 0` and a reset time. New section "the last use decides (ITM-161)":

| Case | Expected |
|---|---|
| N1 the page's own read | the architecture view's read with the token refused → kept `{"refused":true}`, refusal at the top; the same read answered → kept `{"ok":"<today>"}`, nothing at the top; after a reload the line is `✓ works — tested <today>` |
| N2 the next page load | *Test* refused; after a reload the settings page's own read of the instance is answered → `✓ works — tested <today>`, nothing at the top |
| N3 a GitLab project token | its *Test* refused; the products' check reads the project with it, answered → `✓ works — tested <today>`, kept as `tested: {"ok":"<today>"}` |
| N4 a used-up rate limit | *Test* refused; after a reload the instance read is answered `403` with a used-up limit → still `✗ refused`, kept `{"refused":true}` |
| N5 another token's success | GitHub token refused, then the GitLab project token's *Test* answered → the GitHub token stays `✗ refused` |

N3 in the first commit pressed the products' check right after storing the entries; the page reads its product list at load, so
no request was made — red for a wrong reason. The implementation commit corrects it: the person's *Remove* of a second product
makes the page read the list, and the case asserts that the check read the GitLab project. Shown red on the code of `37449fc` in
its corrected form (below).

No expectation changed. `tests/dashboard-review-flows.test.mjs` ("UC-042 1b") and `tests/test_settings_page.py` hold unchanged.

## 4. Red first

Commit `b9ccbe3` (tests only; the code of `sprint/03` at `37449fc`). Local `node --test tests/dashboard-settings-last-test.test.mjs`:
18 tests, **3 fail** — N1 (actual `{ refused: true }`, expected `{ ok: '2026-10-03' }`), N2 (actual `✗ refused — GitHub did not
accept it at the last use`, expected `✓ works — tested 2026-10-03`), N3. CI on pull request #84: runs `37119027447` (push) and
`37119035476` (pull request) — **failure**, step *Dashboard core*: 537 tests, 3 fail (N1, N2, N3). Not rerun.

The corrected N3, with the code of `37449fc` restored for the two code files: red (the GitLab line stays `✗ refused`); N1, N2 red
as before.

N4 and N5 were green on `37449fc`: they guard what must not change (a rate limit and another token leave a refusal standing);
each is shown red below on a fault of its own.

## 5. Counter-proofs — each fault planted alone on the green tree, the file run, the fault removed

Script `scratchpad/itm161/mutate.py` in the session scratchpad (not committed): one line replaced, `node --test
tests/dashboard-settings-last-test.test.mjs` run, the file restored; afterwards both code files compared equal to their copies.

| Fault | File | Red |
|---|---|---|
| F1 the fetch watcher is not installed | `dashboard-app.mjs` | N1, N2, N3 |
| F2 any answer but a 401 counts as a success | `dashboard-app.mjs` | N4 |
| F3 an answer clears every kept refusal, whatever token it carried | `settings-store.mjs` | N5 |
| F4 a GitLab project token's refusal is never replaced | `settings-store.mjs` | N3 |
| F5 only `Authorization` is read, not `PRIVATE-TOKEN` | `dashboard-app.mjs` | N3 |
| F6 an answer writes `ok` over a token not tested yet too (reading 3) | `settings-store.mjs` | five existing cases: "a successful Test … shown after a reload" (before any test), "a new token stored with Change starts untested", "Clear removes the kept date …", "a GitLab project token changed or cleared …", "an import that keeps this browser's own token …" |

Every new case is red on at least one fault.

## 6. Green

The implementation commit, on a clean tree: `node --test tests/*.test.mjs` — 537 tests, 533 pass, 0 fail, 4 todo;
`cd tests && python3 -m unittest` — 367 tests, OK (5 expected failures). Before the item, on `37449fc`: 532 tests (528 pass, 0 fail,
4 todo) and 367 tests, OK (5 expected failures).

## 7. Addendum, 2026-10-03 (same day, third commit): the watcher never fails a request

Sections 1–6 describe the implementation commit `d3e1320`; they stay as written. CI on `d3e1320`: runs `37119397933` (push) and
`37119399640` (pull request) — **success**.

**Finding after `d3e1320`.** Section 2, reading 4 says the watcher never changes the answer. On `d3e1320` that did not hold in one
case: `watchAnswers` called `noteAnswer` without a guard, so an error while noting the answer — a storage whose `setItem` throws, as
a full `localStorage` does (`QuotaExceededError`) — was thrown from the browser's `fetch` itself, and the request that had been
answered failed for its caller. Path: `fetch` (wrapped) → `noteAnswer` → `store.tokenAnswered` → `setTokenTest` →
`storage.setItem` throws → the view's read fails → `route`'s `catch` → `<main>` shows `<p class="warn">The quota has been
exceeded.</p>` in place of the architecture page (seen at that node with the probe `scratchpad/itm161/probe3.test.mjs`, the guard
removed). MOD-settings-store's architecture names a storage that throws as a case to simulate. A blocked storage does not reach
this: `browserStore` falls back to an in-memory stand-in that does not throw.

**Change.** `dashboard-app.mjs` `watchAnswers`: `try { noteAnswer(…) } catch {}` — the caller gets the answer, and the kept state
stays as it was.

**New case** (same file, header, module and level as in section 3):

| Case | Expected |
|---|---|
| N6 a storage that refuses to write | refused at the architecture view's read; `localStorage.setItem` then throws `QuotaExceededError`; the same read answered → `<main>` shows the architecture page (contains `ARC-001`, no storage error), the kept value stays `{"refused":true}` |

N6 is red on the code of `d3e1320` (assertion "the architecture file is shown": actual `false`) and green with the guard; the known
positive of the check is that green run (`<main>` begins with the architecture page's head, *Architecture*, open 1).

**Counter-proofs, rerun on the final tree** with `scratchpad/itm161/mutate.py`, fault F7 added; F1–F6 turn the same cases red as in
section 5:

| Fault | File | Red |
|---|---|---|
| F7 an error while noting the answer fails the request (the `try/catch` removed) | `dashboard-app.mjs` | N6 |

**Green, final tree:** `node --test tests/*.test.mjs` — 538 tests, 534 pass, 0 fail, 4 todo; `cd tests && python3 -m unittest` —
367 tests, OK (5 expected failures).
