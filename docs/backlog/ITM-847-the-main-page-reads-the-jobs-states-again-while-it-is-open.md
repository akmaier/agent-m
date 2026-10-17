---
id: ITM-847
title: The main page reads the jobs' states again while it is open
level: unit
realises:
  - UC-046
modules:
  - MOD-main-page
builds_on:
  - ITM-827
tests:
  - unit
origin:
  - ITM-827's draft stop (sprint team1/78), from developer-sonnet-e's draft
---
# ITM-847 The main page reads the jobs' states again while it is open

**REGISTER**

## Outcome

UC-046 step 4 says the card keeps the build "current while the page is open". `docs/architecture/MOD-main-page.md:71-73`
reads: "While the page is open it reads the jobs' states again at an interval the repository servers' rate limits allow,
so the build stays current; it stores nothing between readings."

ITM-827 draws the `home` route once. This item reads the jobs' states again, and only those, through `listJobs`,
`jobState` and `liveState`. Each reading costs requests from the person's token budget. So the start states one reading's
requests at this repository's size, and the interval derived from the rate limit, before it is built.

## Acceptance

- While `home` is open, the jobs' states are read again at the stated interval, and nothing else is read. A test pins one
  reading's requests and the interval, with its counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Decided at its draft stop (sprint team1/79, 2026-10-17, po-opus).**
- **The interval of 60 seconds, and no re-read for a card without a token, are accepted.**
  - With a token, a re-read costs 2 requests per card, or 120 an hour: 2.4 % of the account's 5,000.
  - Without a token, the network's 60 an hour would be used up within half an hour.
  - The notifications check once a minute too.
  - That is "an interval the repository servers' rate limits allow" (`MOD-main-page.md:71-73`).
- **Reading 1 is accepted.** A re-read is no page load, so `A PAGE LOAD READS THE REPOSITORY IN BATCHES` does not bind it.
  A changed record is read by itself, and no copy of the jobs' path is made.
- **Reading 2 is accepted for now:** the token through MOD-main-page's own `tokenKeyOf`. The frame's `tokenStored`,
  stated and not built, is ITM-856, after which the copy goes.
- **A used-up limit waits.** `RateLimited` carries `resetsAt` (`MOD-repository-hosts.md:152`). The re-read waits until then,
  instead of retrying each minute, with a test.
- **A hidden tab** keeps re-reading, as the module's text says. Pausing it is a draft first: ITM-858.
- **Many not-ended CI jobs** each list the runs. That is ITM-857.
- **The split `diff`.** After its compound command was refused, the developer ran its `diff` alone. Sprint 78's agreement
  reads: "A refused command is reported, not run again in another form". That goes to the retrospective.
- **The fetch spy is owed before the pull request.** It runs as one plain command, or the refusal is reported.

**Corrected at ITM-848's gate (2026-10-17 22:59 UTC, po-opus).** The split `diff` above is accepted. Splitting a refused
compound command into plain, separate commands is no way around the guard (`79.md`, "A refused command, split").
