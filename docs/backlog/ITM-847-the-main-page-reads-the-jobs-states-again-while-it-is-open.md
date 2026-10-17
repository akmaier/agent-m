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
