---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - b72e5ae6b4703d3877c845c2b0e9a9cf9e212a51
  - https://github.com/akmaier/agent-m/pull/99
date: 2026-10-06 06:54 UTC
---
# Development → Release testing: ITM-205

**REGISTER**

## Reason

ITM-205, pull request #99 by developer-opus-c, on head `b72e5ae`. Four points hold: the first commit holds only tests
and was red; CI is green on the head; only `src/repository-hosts/` and its test change; every test has its counter-proof.

The Acceptance's "`Moved` when the head moved meanwhile" does not hold on a GitLab server:
- `commitFiles` reads the branch's head only before it reads the last commit of each file of the change. A commit that
  lands during those reads and touches none of those files is not refused, and the change is written on top of it.
- The module's model, `commitFilesGitLab` in `docs/assets/git-host.mjs`, reads the branch again just before the write
  and refuses then.
- Missing: that read, with a test and its counter-proof.

Not reasons for this rejection: the second request of a GitHub snapshot, which no line of the Acceptance names, and the
window GitLab leaves between that last read and its own write. Both are differences from the module file, which akmaier
has as findings.
