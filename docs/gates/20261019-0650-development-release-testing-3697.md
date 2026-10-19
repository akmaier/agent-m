---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7021899dbbca3f30c3e043a9f569f74aeee5d0af
  - https://github.com/akmaier/agent-m/pull/961
date: 2026-10-19 06:50 UTC
---
# Development → Release testing: ITM-959, the SPEC check test_mail_replies.py

**REGISTER**

## Reason

ITM-959, pull request #961 into `sprint/team2/95`, passes on `7021899d`. CI is green on the head, on 20 of 20 jobs.

1. **Scope.** Only `tests/test_mail_replies.py` and `tests/test_mail_replies.md` are added, and `src` is unchanged, as the
   Acceptance says.
2. **Red first, read for a release check.** The item adds tests over code that is already built (ITM-952, ITM-953), so the
   Acceptance asks for planted faults instead of a red commit. The pull request tables 25 of them, and each of the 23 cases
   fails under at least one.
3. **Run here** (agreements 83 and 89). The file passes on the head. With `setIssueLabels` removed from `askReporter`
   (replies.mjs:140), it fails "A question sent to a reporter labels the open issue and leaves it open", as F18 says.
   Restored afterwards.
4. **The header** names MOD-mail-handling, level release, and the eleven requirements and UC-039. Each case states its
   given, input and expected result in the `.md` (AGENTS.md §7).
5. **The writer** is developer-sonnet-i, who implemented neither ITM-952 nor ITM-953
   (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). i read SPEC.md and chapters 9, 11, 12 and 13, and named a
   passage of each.
6. **Findings ruled:**
   - **No issue functions on the real host.** Verified with a known positive: the grep that finds no `listIssues`,
     `commentOnIssue`, `setIssueLabels`, `setIssueState` or `createIssue` under `src/repository-hosts/` finds
     `readHistory` and `listPullRequests` there. The accepted text names them (MOD-repository-hosts.md:233-240), so the
     fake host is the accepted interface. The gap is already in the backlog: ITM-581 (list, comment, label, close) and
     ITM-962 (`createIssue`). Both are unbuilt, have no pull request, and `conflicts` holds them against team 1's sprint
     93 (MOD-repository-hosts, ITM-686 and ITM-709). No new item. Until they are built, UC-038 and UC-039 do not run end to
     end against a real host.
   - **Reopened only by a person.** This holds because nothing reopens. The cases guard against any state call, which is
     what the requirement asks.
   - **The fake mailbox** threads the draft as the Graph route does (graph-route.mjs:252). MOD-mail-handling sees only the
     `Mailbox` interface, so that suffices here; the Bridge route's threading is its own module's check.
   - **The item's line reference** `:95-103` now reads `:101-108` (REGISTER, this commit).
