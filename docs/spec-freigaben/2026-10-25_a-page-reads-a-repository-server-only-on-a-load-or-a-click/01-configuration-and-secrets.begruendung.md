# 7. Configuration and secrets: a page reads a repository server only on a load or a click; what it would read across many runs or commits is precomputed

**The change.** Two new requirements, after `A PAGE LOAD READS THE REPOSITORY IN BATCHES`:
- `A PAGE READS A REPOSITORY SERVER ONLY ON A LOAD OR A CLICK` — no timer and no repetition of its own sends a request to
  GitHub or a GitLab server.
- `WHAT A PAGE WOULD READ ACROSS MANY RUNS OR COMMITS IS PRECOMPUTED` — the repository's CI computes it when the
  repository changes and commits it, and the page reads the result in its load.

**Why.** akmaier, 2026-10-25: "make sure never to loop GitHub calls in any UI. This should be preempted." and, on how:
"precomptued". `A PAGE LOAD READS THE REPOSITORY IN BATCHES` bounds one load, but nothing bounds what a page sends after
it: a page left open keeps spending the account's rate limit, and five places do so today. Preempting it takes a rule
every route is checked against, not a fix of each place.

**Design principles** (AGENTS.md §2):
- One responsibility per rule: when a page reads, and where what it shows across many runs comes from, are two sentences.
- Nothing the SPEC already says: `A PAGE LOAD READS THE REPOSITORY IN BATCHES` holds the load; these hold what comes after it
  and what is too large for it.
- Adding one of a kind changes nothing of another: GitHub and GitLab are both repository servers; the rule names neither.

**Readings.**
- The address changing is a load of the route it names, so moving between pages reads as before.
- `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` stays met: the precomputed file is derived by CI from the
  repositories and committed to them; neither dashboard stores a status of its own.
- `A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE` stays met with its checks on loads and clicks; "between two checks"
  then means between two loads.

**Impact list.**
- Requirements: the two above, new; their check `tests/load-per-view.test.mjs` (MOD-site-frame).
- Code that reads a repository server on a timer today:
  - `src/notifications/checks.mjs:43` (MOD-notifications) — every minute, then the instance's and each product's
    default branch once a check is due;
  - `src/main-page/reread.mjs:76` (MOD-main-page) — the cards' jobs read again at intervals;
  - `src/main-page/jobs.mjs:544` (MOD-main-page) — a cancelling job drawn again every 5 s;
  - `src/prompt-bar/follow.mjs:133` (MOD-prompt-bar) — the job list and live state while a job is followed;
  - `src/test-pages/runs.mjs:243` (MOD-test-pages) — a run's progress while it is on the page.
- Use cases whose steps keep a page current by reading again: UC-036 (live state; 6a, a cancelling job), UC-046 step 5
  ("keeps them current while the page is shown"), UC-047 (the checks), UC-049 (following a job), UC-028 (the run panel's
  progress). Each is changed to read on a load or the person's click once these sentences are accepted.
- Precomputation: MOD-workflow-entries (the CI entries that compute and commit), MOD-progress-measures (`storedFacts`),
  MOD-job-ledger (the job list), MOD-result-records (the runs of a commit).

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
