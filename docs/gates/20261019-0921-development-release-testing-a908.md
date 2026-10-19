---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f9f5ae71d994815c398f19f4bb83a3736608733d
  - https://github.com/akmaier/agent-m/pull/991
date: 2026-10-19 09:21 UTC
---
# Development → Release testing: ITM-908, passed — each commit's graph is added to the branch trace-cache

**REGISTER**

## Reason

ITM-908 (MOD-trace-graph, MOD-workflow-entries), pull request #991 into `sprint/team1/93`, passes on `f9f5ae71`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-a`.**
  - `36e12126` and `c17695ed` hold only tests.
  - `f9f5ae71` holds the code: `src/trace-graph/`, `src/workflow-entries/` and `.github/workflows/main-changed.yml`.
- **The red,** run 39228109897 on `c17695ed`, each job with `# cancelled 0`:
  - `# fail 4`: TST-908001 to 004, `publishGraph`.
  - `# fail 4`: TST-908101 to 104, `onMainChanged` and the workflow file. That job's 2 todo are findings of A RECORD IS
    EVIDENCE, NOT A PROPOSAL.
- **The code meets the accepted texts:**
  - `publishGraph` adds `<commit>.json` and leaves a file the branch holds. It fails with `Moved` and with `NotFound`.
  - `onMainChanged` adds the commit's graph (MOD-workflow-entries.md:200-204).
  - The impact lists and the overview are ITM-939, ITM-940 and ITM-941.
- **SPEC.md:771-773 A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET** does not cover this workflow.
  - A job is a role's work handed to a participant (SPEC.md:1693), and the sentence's check is "the generated job
    workflow".
  - `main-changed.yml` runs an instance entry and no job, as `fetch-sources.yml` does with `secrets.GITHUB_TOKEN` and
    `contents: write`.
- **SPEC.md:1448-1450 EVERY CODE FILE BELONGS TO A MODULE:** the parts of MOD-workflow-entries (:115) name only
  `apply-approvals.yml` and `fetch-sources.yml`, so `main-changed.yml` is named in no module's parts yet. The draft that
  names it is ruled in 93.md. Until akmaier accepts it, the file falls short of that sentence.
- **CI:** run 39228868937 passed 20 of 20 jobs on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`80c78936`) is clean.
- **Replayed in a clean worktree at the head:**
  - `trace-graph-publish` and `workflow-entries-main-changed` pass 8 of 8.
  - Counter-proof: when a file the branch holds is written again, exactly "publishGraph leaves a file the branch holds as
    it is" and "onMainChanged leaves a graph the branch holds already" fail.
