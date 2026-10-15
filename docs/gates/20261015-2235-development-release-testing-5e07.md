---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - fc0de1a92ea9113a379f055eeee5f04a46180e44
  - https://github.com/akmaier/agent-m/pull/525
date: 2026-10-15 22:35 UTC
---
# Development → Release testing: ITM-478, The SPEC entries list reads every artifact once per entry

**REGISTER**

## Reason

ITM-478, pull request #525 by developer-sonnet-d into `sprint/team1/28`, head `fc0de1a9`.

1. The three commits before the code hold only test files, and each was red: `8ab84929` (node shard 4), `31688a31`
   (run 38817180638) and `ab090fa1` (run 38817649755).
2. CI is green on the head (run 38817901152, ten of ten jobs).
3. Changed are `src/review-pages/spec-entries.mjs`, the item's module, and the new
   `tests/review-pages-spec-entries-reads.test.mjs` of MOD-review-pages.
4. TST-478101 names its module and requirements; two counter-proofs are recorded in #525.
5. The Acceptance holds:
   - The tick takes the proposal's blob from the queue's tree. It takes the section's blob from `sectionText` and
     `blobSha` on the target, which `groups` reads once per path.
   - That is the computation `acceptEntries` checks a shown entry against (`src/spec-changes/accept.mjs`), so acceptance
     through the ticks writes as before.
   - `view` still builds the full impact list.
   - The regression test counts the reads: before the change `groups` read 4,200 artifacts, with 4,236 reads; now it
     reads none of them.

Noted for the review: MOD-spec-changes' `queues()` reads each entry's target itself. The snapshot's `read` fetches a
file's text once, so the server sees one request for the SPEC, and I accept the Acceptance's "the SPEC read once" as built.
