# Add product names a missing repository and shows Step A as done — the red first commit and eleven planted faults

**MESSUNG** — 2026-10-01, branch `team/ITM-132` (from `sprint/02` at `9b61a73`), macOS 26.6, Node 25.9, Python 3.14.
ITM-132 (implementation job, MOD-dashboard-app): UC-001 2a — "The product repository does not exist yet. Agent M says so and
links GitHub's page for a new repository, with a folded explanation of the choices there" — and UC-001 3a — "The token
already reaches the product … Step A is shown as done". Finding of ITM-123 (`2026-10-01_built-flows-characterised.md`,
section 3): *Check* showed `✗ <owner>/<name>: 404 …`, *Add product* "Your key cannot write to … (… 404 …)", without a link;
Step A's instructions were shown always.

## 1. The path, before and after

**Check** (Step B, GitHub, a token stored) → `dashboard/add-product-view.mjs` `viewAddProduct`, the `#add-check-btn` handler →
`dashboard/settings-view.mjs` `checkReach` → `git-host.mjs` `fetchText(GET /repos/<owner>/<name>)`, which throws an error
carrying `status` when GitHub does not answer 200 → `checkReach` catches it and returns `{ ok: false, error: errorText(e) }`
— the status is not part of its answer.

- **Before:** the handler wrote `reachLine([repo, x])` into `#add-check` — `✗ alice/thesis: 404 Not Found — …` for a
  missing repository, `✓ alice/thesis reachable` for a private one —, and nothing else. Step A was never touched.
- **After:** the handler calls `checkProduct`, which calls the same `checkReach` with a context whose `errorText` notes the
  refused read's `status` before it hands the error on to the page's own `errorText` — no second request, and
  `settings-view.mjs` unchanged. Then:
  - **2a.** With `status` 404, `missingRepositoryHtml(repo)` follows the 4a line: "GitHub has no repository alice/thesis that
    your key can see", the link to GitHub's page for a new repository (`https://github.com/new`), and a folded *What is
    this?* on the choices there — owner, name, public or private, a README so that the repository has a branch, licence. GitHub
    answers a private repository the key does not reach with the same 404 (both cases are one answer to the page), so the
    text names both ways on: create the repository, or let the key reach it in Step A. Step A keeps its instructions.
  - **3a.** Step A is now wrapped in `#add-step-a`. After a read that **succeeded on a private repository** it is replaced by
    *Step A · Let your key reach the product — done*: "✓ Your key already reaches alice/thesis — nothing to do on GitHub",
    with its folded *What is this?* (`stepHtml`). After any other answer it is written back with its instructions. A
    successful read of a **public** repository proves nothing about the key — any key reads it; UC-001 step 4 says the same
    ("write access is confirmed at the next step") —, so there Step A keeps its instructions.

**Add product** (Step C, GitHub) → `wireAddGo` → `dashboard/writes.mjs` `addProduct` → `fetchText(GET /repos/<owner>/<name>)`
throws with `status` 404 before anything is written → the handler's `catch`.

- **Before:** `/403|404/` on the message gave "Your key cannot write to alice/thesis yet (404 Not Found — …). Do Step A …".
- **After:** a GitHub 404 that is not a used-up rate limit gives `missingRepositoryHtml(repo)` — the same text, link and
  explanation as *Check* —, and *Add product* can be clicked again. Every other refusal is answered as before, word for word
  (the 403 of 5a included). Nothing was written and nothing kept, as before.

GitLab products are unchanged: their *Check* (`checkGitLab`) keeps its own 404 text.

API economy: no request added — *Check* reads `GET /repos/<owner>/<name>` once, as before; *Add product* as before.

## 2. The tests

`tests/dashboard-add-product.test.mjs` — `Module: MOD-dashboard-app`, `Guards: UC-001; EVERY STEP EXPLAINS ITSELF; ONE CLICK PER
DECISION`, `Level: component`. The real dashboard runs in `tests/app-harness.mjs` (with `richDocument` and `press`) against the
harness's GitHub fake: the instance's repository and the product's behind it; every request recorded, every click a person's.
The harness keeps each element's HTML apart; Step A as a person sees it is `#add-step-a` once the view has written it, else the
first step of `#add-steps` (`stepA` in the test).

| Test | What it checks |
|---|---|
| A1 | 2a, *Check* on a 404: the 4a line first; the repository named as not found; the link to `https://github.com/new`; a folded *What is this?* naming the README; Step A not done, with its instructions; no request but reads, nothing written |
| A2 | counter-proof: *Check* on an existing repository shows ✓ and links no page for a new repository |
| A3 | 2a, *Add product* on a 404: the repository named, the link, the folded explanation; nothing written, the address not kept, *Add product* clickable again |
| A4 | counter-proof: a write refused with 403 (5a) keeps its sentence word for word and links no new repository |
| B1 | 3a: a private product read with the stored token — after *Check*, Step A is *done*, without instructions, with its *What is this?*; nothing written by *Check*; *Add product* is the one remaining click and writes the layout |
| B2 | counter-proof: a token that does not reach the private product (404) keeps Step A's instructions, not *done* |
| B3 | a public product: *Check* ✓ with "write access is confirmed only by the first write", Step A keeps its instructions, not *done* |

## 3. Red first

Commit `ff9bafe` (tests only; the code of `sprint/02` at `9b61a73`):

- local: `node --test tests/*.test.mjs` — 315 tests, 309 pass, 3 fail (A1, A3, B1), 3 todo (R1–R3 of the release tests,
  unchanged); A2, A4, B2 and B3 pass — the dashboard of `sprint/02` already links no new repository and never shows Step A as
  done. `cd tests && python3 -m unittest` — 197 tests, OK.
- CI on pull request #50: runs `36922841942` (push) and `36922857419` (pull request), both `fail`; the log of the second shows
  *Dashboard core* with `# tests 315`, `# pass 309`, `# fail 3`, `# todo 3` — `not ok 33` (A1), `not ok 35` (A3),
  `not ok 37` (B1); the Python step passed.

Before the item (`sprint/02` at `9b61a73`): node 308 tests, 305 pass, 3 todo; Python 197 OK.

## 4. Counter-proofs

**Method.** A script (in the session's scratchpad, not committed) planted each fault below by replacing one snippet of
`docs/assets/dashboard/add-product-view.mjs` — refused unless the snippet occurs exactly once —, ran
`node --test tests/dashboard-add-product.test.mjs tests/dashboard-review-flows.test.mjs tests/release-sprint-01-dashboard-app.test.mjs`
(125 tests, 3 of them todo), read the failing tests from node's own report and restored the file; after the series the three
files ran green again (122 pass, 3 todo, 0 fail). M1 is the known positive that this reading sees a failure.

| Mutation | Fault planted | Red |
|---|---|---|
| M1 | *Check* does not append the 2a part | A1 |
| M2 | *Check* appends the 2a part whatever the answer | A2, B1, B3; UC-001 main flow of `dashboard-review-flows` (its *Check* line asserted exactly) |
| M3 | *Add product* answers a 404 as before | A3 |
| M4 | *Add product* answers every refusal with the 2a part | A4; 5a of `dashboard-review-flows` |
| M5 | Step A is never shown as done | B1 |
| M6 | Step A is shown as done after any *Check* | A1, B2, B3 |
| M7 | Step A is shown as done after any successful read, a public repository included | B3 |
| M8 | the done Step A is written by hand, without its explanation | B1 |
| M9 | the 2a part has no folded explanation | A1, A3 |
| M10 | the 2a part links no page for a new repository | A1, A3 |
| M11 | the status of the refused read is not kept | A1 |

Every new test is red under at least one mutation: A1 under M1, M6, M9, M10, M11; A2 under M2; A3 under M3, M9, M10; A4 under
M4; B1 under M2, M5, M8; B2 under M6; B3 under M2, M6, M7.

## 5. After

Implementation commit: `node --test tests/*.test.mjs` — 315 tests, 312 pass, 0 fail, 3 todo; `cd tests && python3 -m
unittest` — 197 tests, OK. No existing test or asserted value changed; the release tests of sprint 01 keep their three `todo`
marks.
