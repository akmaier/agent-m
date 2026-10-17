---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - ddbe312e1c7af3b65f092cbd52e29dd3b520cb2b
  - https://github.com/akmaier/agent-m/pull/764
date: 2026-10-17 20:15 UTC
---
# Development → Release testing: ITM-748, the host merges a pull request at the head that was read

**REGISTER**

## Reason

ITM-748, pull request #764 by developer-sonnet-i into `sprint/team2/78`, on head `ddbe312e`. What holds:
- The first commit, `86a5011a`, holds only `tests/repository-hosts-merge-pull-request.test.mjs`, and CI was red on it.
  In node (2) the 12 new cases failed. In node (1) TST-294001 failed, a TLS tunnel test that is not part of this item.
- CI is green on the head.
- Scope: `src/repository-hosts/{index,github,gitlab}.mjs` are in the module's folder. The new test's header names
  MOD-repository-hosts.
- Every new test names the requirements it guards and its module.
- Acceptance, as the change reads: a merge at the expected head returns the merge commit, and a moved head is `Moved`
  with no merge sent. 405 and 422 are `NotMergeable` with the server's message. 401, 403 and 429 are named as the item
  says, and a call without a token is `NotSupported`.
- The readings stay within the accepted text: the head is read first and also sent as `sha`; `Moved.head` is null on a
  409; no merge method is sent.

Why it is rejected (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`): 12 counter-proofs are recorded for 12 new
tests, but two of the tests have none. No recorded fault names "mergePullRequest on GitLab — a head that moves after it
was read is refused by the server and is Moved" or "mergePullRequest on GitHub — each failure is named, beside the
success".
