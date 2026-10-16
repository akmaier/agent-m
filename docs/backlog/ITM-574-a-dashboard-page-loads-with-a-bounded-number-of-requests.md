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

The live dashboard meets `A PAGE LOAD READS THE REPOSITORY IN BATCHES`, which the SPEC queue
`docs/spec-freigaben/2026-10-17_a-page-load-reads-the-repository-in-batches/` drafts for akmaier. With a token on
GitHub, one page load:
- reads its commit and that commit's tree once;
- reads the files it shows in requests of at most 100 files;
- reads no blob it has read already.

An acceptance reads the head it commits on once.

**The measurement**, `docs/measurements/2026-10-17_dashboard-load-requests.md`, measured on `c7717fd1`:
- **The counts.**
  - The start page sends 51 requests, `#arc` 91, `#spec` 116 and `#backlog` 563.
  - A reload of the same commit sends 51 again.
  - All are REST; no batch is ever sent.
- **The causes, each traced at its failure node.**
  - `fileText` (`docs/assets/dashboard-app.mjs:288`) reads through `Snapshot.read`, which is one `/contents/` request
    per file (`src/repository-hosts/github.mjs:223`). The loading code never calls `Snapshot.readMany`.
  - `readAt` (`dashboard-app.mjs:270`, called at `docs/assets/dashboard/writes.mjs:72`) builds a snapshot per path.
  - `#spec`, process, release, roles and backlog open hosts of their own, whose caches start empty.
- **The cache of file texts across loads** was retired by `d8c69b76` (2026-10-10), which also runs `retireFileTexts`
  (`dashboard-app.mjs:622`). `b9a65089` changed only the tests that expected it. The draft does not bring it back,
  since it would change MOD-browser-store's text and the batches suffice.
- **Refuted.** Resetting `memo` on an unchanged commit costs only the commit and the tree.

**How it is changed.** No module owns the loading code. The SPEC queue's entry 02 adds to
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` the form "makes old code meet a requirement of this specification by
calling a module's interface as the module's file states it, together with the test that checks that requirement". The
fix is a pull request of that form:
- one host and one snapshot per load, its files read with `Snapshot.readMany` ahead of their reads;
- `readAt` reading the head's snapshot once per acceptance;
- `tests/load-per-view.test.mjs` counting it.

MOD-repository-hosts, named under `modules`, is the module whose interface the fix calls. Its file and its code do not
change.

**Ready to be selected** once akmaier accepts the queue.

**Not in it.** The prompt bar's reads (`productFacts` at a hand-over, the poll every 15 s) and the notifications check
were not measured. Bounding them is a later item, after a count.

## Acceptance

- Over a counting fake GitHub that serves the batch request, each of the start page, `#arc`, `#spec` and `#backlog` sends
  its commit and tree once and one batch for every hundred files it shows.
- An acceptance of three files reads its head once.
- The counter-proof: the loading code as it stands exceeds those counts, and the test is seen failing on it first.
- A used-up limit is still named, never blamed on the token.
