---
id: ITM-574
title: A dashboard page loads with a bounded number of requests
level: system
realises:
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
  - UC-006
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-479
tests:
  - component
  - release
origin:
  - akmaier, 2026-10-16, after accepting four module files on the dashboard (3f3af683): "The excessive use of token requests is still a problem that needs to be fixed." — "The problem is not the accept click but the loading code of the dash board. I am sure it still uses excessive number of token acceseses."
---
# ITM-574 A dashboard page loads with a bounded number of requests

**REGISTER**

## Outcome

One load of a dashboard page sends at most a stated number of requests with the repository token the person stores in
it, split into REST and GraphQL. A second load of an unchanged tree sends fewer. That token's rate limit is the one used
up. The fix is in the dashboard's loading code and in the host code.

**The live loading code is code that no module owns.**
- `docs/index.html` loads `assets/dashboard-app.mjs`. No HTML page loads MOD-site-frame's `start.mjs`.
- No module file names a folder under `docs/assets/`. The known positive: `folder: src/run-planner` is found in
  MOD-run-planner.
- The headers of `tests/load-per-view.test.mjs` still name MOD-dashboard-app, whose file is gone from
  `docs/architecture/`.

**Leads, which the measurement confirms or refutes.** None is a finding yet.
1. **Every file read is one REST request.** With a token, `readFile` (`src/repository-hosts/github.mjs:223`) is one
   `/contents/` request per file.
   - `Snapshot.readMany` (`src/repository-hosts/index.mjs:213`) batches through GraphQL `readFiles` (`github.mjs:234`),
     but the loading code never calls it. `git grep readMany -- docs/assets` finds nothing. The same grep over `src/`
     finds `src/trace-graph/build.mjs:185` as the known positive.
2. **The cross-load cache was removed.** On 2026-10-10, `b9a65089` ("Align existing fixtures with accepted browser
   storage behavior", developer-terra-e) removed the cache of file texts kept by blob SHA across loads.
   - The expectation "a second load on an unchanged tree reads no file — the texts are kept by their blob SHA" became "a
     second load on an unchanged tree reads its displayed files again" (`tests/load-per-view.test.mjs:152`).
   - That test's own header still gives the reason for the cache: "on 2026-10-01 the PO's account used up its 5,000
     requests per hour … about 450 requests" for one page load.
   - Which accepted text required the removal is read before the start.
3. **Within one load**, the host's `texts` cache is kept by blob SHA for as long as the host lives
   (`src/repository-hosts/index.mjs:195`). `dashboard-app.mjs:212–220` keeps one host per address and token. Whether
   `loadSnapshot`'s reset of `memo` (`dashboard-app.mjs:266`) causes a request is measured.
4. **A snapshot per read.** `readAt` (`dashboard-app.mjs:270`) calls `readSnapshot`, a tree request
   (`github.mjs:168`), once for each path an acceptance reads.

**Not ready for a sprint yet.** Its readings are settled before it is selected.

**1. Measure.** A developer who changes no product file records a MEASUREMENT under `docs/measurements/` with its
method.
- **The harness.** The counting GitHub mock of `tests/app-harness.mjs` (`repoServer`, `openDashboard`), with a GraphQL
  endpoint where the lead needs one.
- **The known positive.** `tests/load-per-view.test.mjs`'s counts, and TST-479201's at most 22 requests for one
  SPEC-entry page of 1,332 files.
- **What is counted.** For a product of this repository's size, by method and path, split into REST and GraphQL:
  - the first load of the main page and of each review view;
  - a second load of an unchanged tree;
  - one load after an accept.
- **The bar's reads**, counted the same way: one hand-over assessment (`productFacts`,
  `src/prompt-bar/hand-over.mjs:55`), one poll of a followed job (`src/prompt-bar/follow.mjs:18`, every 15 s), and one
  notifications check (`src/notifications/checks.mjs:22–23`).

**2. The bound, from the texts.** What the texts give today:
- `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN` (SPEC.md:664) names the failure and bounds nothing.
- ITM-479's release tests bound only the SPEC-entry page.
- `Snapshot.read` "fetches a file's text once" per host.

No text bounds the requests of a page load. So the bound is a draft for akmaier on `main`, made from the measurement,
not a question. It covers what is read in batches, and what a second load of unchanged blobs may read.

**3. Who may change what.**
- MOD-repository-hosts is changed by this item.
- `docs/assets/` is code no module owns. `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` (SPEC.md:1421) lets a pull
  request between jobs only make old code call a module in place of its own code, among the forms it names.
- **Read at sprint team1/54: no named form fits a fix inside the loading code.**
  - The rule's forms are these:
    - making old code call a module in place of its own code;
    - removing what a module now provides;
    - naming a test's module;
    - letting a whole-repository check allow a stated use;
    - letting a test helper reach the modules' files;
    - a workflow file that only runs a module's entry.
  - Adding a call of `readMany` ahead of `fileText`'s reads replaces none of the loading code's own code, so it is none
    of these. Bringing back the cache of file texts across loads is not one either.
  - Two forms of the fix stay open, and the bound's draft chooses between them:
    - `docs/index.html` loads the module-built site through `start.mjs`, in place of `assets/dashboard-app.mjs`. That is
      the first form. ITM-574's bound then holds for the modules' loading.
    - A SPEC change that admits the loading code's fix between jobs. That is a draft for akmaier through a SPEC queue.
- **The cache across loads.** `d8c69b76` (2026-10-10) retired the Cache Storage `agent-m-file-texts`, in the course of
  "canonical storage". MOD-browser-store's table of keys names no store of file texts. Bringing such a cache back is a
  change of MOD-browser-store's text, and part of the bound's draft.

**Earlier work.** `docs/backlog` was grepped for "rate limit", "readMany", "GraphQL" and "batched read"; the known
positive is ITM-479, which batched the trace graph's reads after akmaier's earlier report. The tests were grepped for
"5,000 requests", which found `tests/load-per-view.test.mjs` and its history above.

## Acceptance

- A component test counts the requests of one page load, and of a second load of an unchanged tree, over the counting
  mock. It holds both at or under the accepted bound.
- The counter-proof: the loading code as it stands exceeds the bound, and the test is seen failing on it first.
- A used-up limit is still named, never blamed on the token.
- The release test is written by a developer who implemented none of it.
