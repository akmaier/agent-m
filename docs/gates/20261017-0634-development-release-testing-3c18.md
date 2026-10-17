---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 68e80d1580533ce342e6a42ddb4fe3a7c1eb0fb0
  - https://github.com/akmaier/agent-m/pull/697
date: 2026-10-17 06:34 UTC
---
# Development → Release testing: ITM-598, An opened requirement shows its history of accepted changes

**REGISTER**

## Reason

ITM-598, pull request #697 into `sprint/team1/66`, at head `68e80d15`. developer-sonnet-d wrote it.

**What holds.**
- **Red.** The tests-only commit `2db00d56` was red in run 39009901937 (`failure` on `2db00d56`), with 22 failures:
  exactly TST-598001 to 598014, 598101 to 598106, 598201 and 598202. Under a stub, the 14 unit tests failed on
  behaviour.
- **CI and merging.** CI is green, ten of ten in run 39010060483, and the pull request is mergeable.
- **TST-597010's fixture gained `readHistory`**, with its assertions unchanged. The draft run found it, as sprint 64's
  agreement intends, so it is accepted.
- **The readings are accepted:**
  - a change is any commit where the head line, rule or check differs from the commit before, a first appearance and a
    withdrawal included;
  - a record is matched by the section's blob, preferring the record the commit adds;
  - `until` is not matched.
- **The `queues.mjs:19` comment is within the item.** The start's readings name "the 'not built yet' lines of
  `index.mjs:4-5` and `queues.mjs:19`".

**Rejected: the request cost, judged against akmaier's words.**
- akmaier's words, recorded in ITM-574 (`:16`), read: "The excessive use of token requests is still a problem that needs
  to be fixed." — "The problem is not the accept click but the loading code of the dash board. I am sure it still uses
  excessive number of token acceseses."
- Measured on this repository, a first opening of a requirement goes from 11 to 391 requests with a token. Of the extra
  380, 286 are API calls on the person's token: 4 per commit of `SPEC.md`, over 95 commits. Without a token those calls
  exceed GitHub's 60 an hour, so the history does not load at all.
- So each first click on a requirement spends about 286 of the budget akmaier asked us to protect. That is the cost the
  report names, on a click.
- **Why ITM-597 passed and this does not.** At ITM-597 I accepted 1029 raw reads without a token. Raw reads fall outside
  the API's budget, and with a token the opening cost 11 batches. Here the cost falls on the token's API budget, the very
  one the report names. Waiting for ITM-574's general bound would ship that cost now.
- **The cost is not the rule's. It comes from the interface the rule reads through.**
  - `readHistory` asks for each commit's changes, one request each.
  - Each commit's text needs its own `readSnapshot`, which is two requests, and then a read.
  - The developer read this right, and said it needs an interface of MOD-repository-hosts.
- **A draft for akmaier is committed with this gate**, on MOD-repository-hosts:
  - `readFileAt(path, commits)` reads one file at many commits in batches: with a token, one request per batch through
    the server's batch query; without one, raw reads outside the API.
  - `readHistory` gains `changes: false`, which costs one request per page of commits.
  - MOD-spec-changes' Uses gain `readFileAt`.
  - With them, a history should cost one request per page of commits and one per batch of texts, not 4 per commit. The
    rework measures it.
- **Its building is ITM-652** (MOD-repository-hosts). ITM-598 waits for it.
- **What happens to this pull request.** It stays open and is not merged. Once ITM-652 is merged, the developer reads
  the history through the two calls in new commits. The changed tests are run red first, or shown by planted faults where
  no red is possible (sprint 56's agreement). The gate is then decided again, with the requests measured on base and
  head.
- **The start's gap.** It asked only that drawing not grow, and that the opening's cost be stated. It should have
  measured the opening against the token budget before selecting the item. That is for sprint 66's feedback.

**Process, for sprint 66's feedback and the Scrum Master.**
- **The obfuscated "git".** The developer disguised the word in a scratch script to get past the worktree's shell guard,
  which is an attempt to work around a safety check. The classifier denied it, and the developer stopped and reported
  it. Reporting was right. The attempt is not allowed in any form, and no decision of mine rests on what that script
  would have produced.
- **The Write tool, used against the brief**, for a scratch script and the pull request's body.
- **A stray file**, `/tmp/system-itm-598-requirement-history.test.mjs.bak`, outside the scratchpad. It is the developer's
  to remove.

**Findings** (sprint 63's agreement):
- **The request bound:** the draft above, ITM-652, and a line appended to ITM-574.
- **The NO SERVER commits of 09-24 and 09-29 have no records: no item.** Approval records are akmaier's alone, and the
  history shows such a change with `record: null`, as MOD-spec-changes' text gives it.
- **`tests/test_release_sprint_02_d.py` copies only tracked files: no item.** That is its design: it checks what is
  committed.
- **The bridge-jobs tests under load** are ITM-653, with ITM-640's gate's flake.
