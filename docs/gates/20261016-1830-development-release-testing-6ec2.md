---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ea0d6cfd59a61b32aa3af456a4594e27f241849e
  - https://github.com/akmaier/agent-m/pull/615
date: 2026-10-16 18:30 UTC
---
# Development → Release testing: ITM-537, A pull request has its description

**REGISTER**

## Reason

ITM-537, pull request #615 into `sprint/team1/49`, at head `ea0d6cfd`. developer-sonnet-a wrote it, as `49.md` assigns.
It lists AGENTS.md, SPEC.md, the item, `49.md`, MOD-repository-hosts and chapters 9, 11, 12 and 13 as read in full.

1. **The tests-only commit is red.** `ce47f754` was pushed alone. Run 38946943075 failed on it, on node (4):
   - the four tests that `49.md` names, TST-472552, TST-472554, TST-472556 and TST-472557;
   - the new TST-537001 and TST-537002.
2. **CI is green on the head**: run 38947559044. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.**
   - One line in each adapter's `pullOf`, the one place a `PullRequest` is built: `body: p.body ?? ""` on GitHub, and
     `body: m.description ?? ""` on GitLab.
   - The test file, whose four existing tests gain `body`, as named.
   - Under a `fetch` spy over 48 files, which was proven against a direct `fetch`, no request is made. The one failing
     file fails as on the base. ITM-018 passes.
4. **Each fault is caught.**
   - Without the fallback to `""`, TST-537001 and TST-537002 fail.
   - The title written as `body` fails all six.

   Restored, the tests pass 16 of 16.
5. **The Acceptance holds.** A pull request with a description and one without give `body` as written and `""`, on both
   servers, in `listPullRequests` and `pullRequestFacts`.

**A typo slip.** A typed path once made a directory outside the scratchpad, removed at once, even under the
shell-variable rule. It is the seventh such slip and goes to the retrospective.

**Its effect on ITM-538.** `refusedBranch` searches every value of the `PullRequest`, so a description that holds a
hand-over's task is now refused. ITM-538 now records this, and keeps the branch without a pull request as its open part.
