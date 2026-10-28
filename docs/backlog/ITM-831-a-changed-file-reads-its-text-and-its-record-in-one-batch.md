---
id: ITM-831
title: A changed file reads its text and its record in one batch
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-approvals
builds_on:
  - ITM-652
tests:
  - unit
origin:
  - ITM-710's draft stop (sprint team1/76), from developer-sonnet-d's draft and count
---
# ITM-831 A changed file reads its text and its record in one batch

**REGISTER**

## Outcome

On a changed file's page, `lastAcceptedText` reads the file and its approval record's text as two single reads
(`src/approvals/status.mjs:142-171`: the record at `:155`, the file at the record's commit at `:166`). Since `58c93ec2`
(ITM-942) a decision or module file takes its last accepted text from the impact entry stored for the commit, with one
`readFileAt` (`src/review-pages/stored.mjs:15-23`); `lastAcceptedText` stays the way for every other kind and for such a
file without a fitting stored entry (`src/review-pages/flow.mjs:367-368`). Batching
them needs the record's path from MOD-approvals, and no interface gives it. So a draft of `MOD-approvals.md` for akmaier
comes first. The lead was seen in fixtures only, and the start counts it at this repository's size.

## Acceptance

- The accepted draft's interface is built, and a changed file's page reads the two in one batch, counted by a test.
