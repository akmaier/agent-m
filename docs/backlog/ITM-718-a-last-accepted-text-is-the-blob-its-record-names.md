---
id: ITM-718
title: A last accepted text is the blob its record names
level: unit
realises:
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
modules:
  - MOD-approvals
builds_on:
  - ITM-680
tests:
  - unit
origin:
  - ITM-715's stop (sprint team1/73), from developer-sonnet-b's row 24
---
# ITM-718 A last accepted text is the blob its record names

**REGISTER**

## Outcome

MOD-approvals' `lastAcceptedText` (`src/approvals/status.mjs:99-115`) finds the commit that added the most recent record,
compares the blob SHA in that commit's tree with the record's, and reads the text by its path. It does not hash the text
it reads.

So a host that serves a text other than the blob the tree names would be compared as if it were the accepted text. The
old view asked for the blob by its SHA, and release test ITM-130 in `release-sprint-02-a-dashboard-app` planted such a
forged text. This was read from the code, not run.

At the start, a unit test serves a forged text for the record's path. It shows whether `lastAcceptedText` compares
against it. If it does, the text read is checked against the record's blob, for example with MOD-text-tools' `blobSha`.
The start also names how many requests that costs.

## Acceptance

- A forged text whose blob is not the record's is not shown as the last accepted text. The test pins it.
- The request count of a changed file's page is measured before and after.
