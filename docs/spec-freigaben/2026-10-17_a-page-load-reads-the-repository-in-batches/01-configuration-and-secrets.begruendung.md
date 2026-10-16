# 7. Configuration and secrets: a page load reads the repository in batches

**The change.** A new requirement, after `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`:
`A PAGE LOAD READS THE REPOSITORY IN BATCHES`. With a token on GitHub, one load of a dashboard page:
- reads its commit and the commit's tree once;
- reads the files it shows in requests of at most 100 files each;
- reads no blob it has already read.

An acceptance reads the head it commits on once.

**Why.** akmaier, 2026-10-16: "The excessive use of token requests is still a problem that needs to be fixed", and "the
loading code of the dash board".

The measurement `docs/measurements/2026-10-17_dashboard-load-requests.md` counts the following on a fake GitHub that
holds this repository's 4,011 files:

| What | Requests | Of which |
|---|---|---|
| The start page | 51 | 49 file reads |
| `#arc` | 91 | |
| `#spec` | 116 | three pairs of commit and tree |
| `#backlog` | 563 | 560 file reads |
| An acceptance of *n* files | 2*n* snapshot requests, plus its reads | |

Every request is REST, one per file, and no request is a batch. The cause is in the loading code, and the measurement
traces it:
- `fileText` reads through `Snapshot.read`, which is one `/contents/` request per file. The loading code never calls
  `Snapshot.readMany`, which MOD-repository-hosts offers and which reads up to 100 files in one GraphQL request
  (ITM-479).
- `readAt` builds the snapshot anew for every path (`docs/assets/dashboard-app.mjs:270`).
- Four views open hosts of their own, whose caches start empty.

Under the requirement, the start page sends 3 requests where it sends 51, and `#backlog` 9 or fewer where it sends 563.
The `/pulls` read counts apart from the bound, which covers the commit, the tree and the files. The number is a
consequence, not part of the text.

No text bounds the requests of a page load today. `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN` only names the
failure, and ITM-479's release tests bound only the SPEC-entry page.

**What it leaves out.**
- **A cache of file texts across loads.** It was retired with `d8c69b76`, and MOD-browser-store's table of keys names no
  such store. Bringing it back would change MOD-browser-store's text, and the batches are enough: a reload of the start
  page is 3 requests.
- **The prompt bar's reads and the notifications check.** The measurement did not count them. A bound for them waits for
  a count.

**Against the rest of the SPEC.**
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` holds, since the batch request goes to the same server's GraphQL API
  with the same token (ITM-479).
- A used-up limit is still named, because GraphQL answers `RATE_LIMITED`, which the host names (`github.mjs:234`).

**Impact list.** `tests/load-per-view.test.mjs`, whose header names MOD-dashboard-app, a module the architecture no
longer holds, so no module owns it. Its counts change with the fix, and entry 02 is what lets a pull request between
jobs change it.
