---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2411ba249264cc9267e993beb741c6a9b2fec80c
  - https://github.com/akmaier/agent-m/pull/1157
date: 2026-10-19 20:17 UTC
---
# Development → Release testing: ITM-1109, repliesDue names the release that contains what solved an issue

**REGISTER**

## Reason

ITM-1109, pull request #1157 into `sprint/team2/97`, passes on `2411ba24`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `fec95551` holds only tests, and CI run 39317163568 failed on it. g read the red run's log.
2. **The accepted text.** MOD-mail-handling's Uses name `listTags` for "the release that contains it" (:150-151). `release` is
   the earliest tag that contains what solved the issue, by ancestry.
3. **g's reading, accepted, and its limit registered.**
   - A pull request's commit is its `head`, the only commit `PullRequest` names (MOD-repository-hosts.md:124-127).
   - So a squash merge gives `null`.
   - The commit a merge made needs a draft of `PullRequest`, registered as ITM-1110.
4. **Changed tests.** Two older tests' fake hosts gain three stub functions, and none of their expectations changed.
5. **Run here.** The merge with #1155 passes 442 of 442 module tests, and `test_mail_*` passes.
