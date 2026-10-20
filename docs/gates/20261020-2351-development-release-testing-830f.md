---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 27deb2febe2a6d4bb29e6c6601bb61a1a93e6fc6
  - https://github.com/akmaier/agent-m/pull/1267
date: 2026-10-20 23:51 UTC
---
# Development → Release testing: ITM-734, the jobs' pull requests and Merge on the implementation page

**REGISTER**

## Reason

ITM-734, pull request #1267 into `sprint/team2/102`, passes on `27deb2fe`. CI is green on 23 of 23 checks.

1. **The reading.** The description names one passage each of the required texts.
2. **Red first, on CI, read from the full job log (jobs API).** The tests-only commit `40fa1888` failed in node (13) only, job
   118950962996. Its `not ok 44` to `48` are TST-734001 to 005: the red and green runs with the Definition of Done and
   *Merge*; a missed condition named with no *Merge*; a refused merge not claimed; a merged one shown done; a pull request
   of no job not shown.
3. **The accepted text.** MOD-implementation-pages, blob `f14f4274`. The route uses `listCiRuns`, `pullRequestFacts`,
   `doneCheck` and `mergePullRequest`, which its Uses name. Only `src/implementation-pages/implement.mjs` and one new
   unit test change, and `unit` is the item's declared level.
4. **Counter-proofs.** Seven planted faults are each caught:
   - an untrusted click;
   - another head;
   - *Merge* always offered;
   - findings dropped;
   - a pull request not the job's;
   - a refused merge claimed;
   - no runs.
5. **f's readings follow the texts:**
   - a job's pull request is one whose body has the `Job: <id>` line, of an `implement` or `refactor` record;
   - *Merge* is offered when `doneCheck` finds nothing and the pull request is no draft;
   - the head is the one `pullRequestFacts` reads, so the merge is on the head shown;
   - the modules come from the record's `works_on`.
6. **Release runs on the head:** traceability 8 of 8, and the Python checks, 10 with 4 subtests (comment 6304385022).
7. **Left out, and registered.**
   - **UC-024 12a is not built.** MOD-implementation-pages names `webLinks` for "the server's page for branch protection"
     (:222-223). MOD-repository-hosts gives no protection field in `RepositoryInfo` (:145-147), and no such page in
     `WebLinks` (:153-160). f stopped rather than guess.
     - 12a is in ITM-734's Outcome, not in its Acceptance, so the item passes without it.
     - It is **ITM-1170**, which begins with a MOD-repository-hosts draft.
   - **"Targets the sprint's branch where the product sets one"** (the item's second paragraph) is UC-034 8a. It belongs to
     MOD-runtimes' pull-request writer, which opens every pull request into the default branch
     (`src/runtimes/pull-request.mjs:56`, `:87`), and MOD-runtimes' text names no sprint's branch.
     - That is outside this item's module.
     - It is **ITM-1171**, which begins with a MOD-runtimes draft.
8. **f's own test.** f fixed its own test helper, and replaced an assertion whose failure message blew up memory. Both are
   in the new file.
