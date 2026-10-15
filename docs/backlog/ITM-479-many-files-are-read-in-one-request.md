---
id: ITM-479
title: Many files are read in one request
level: system
realises:
  - UC-006
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
modules:
  - MOD-repository-hosts
  - MOD-trace-graph
builds_on:
  - ITM-478
tests:
  - unit
  - component
  - system
  - release
origin:
  - akmaier's report that the dashboard used up the account's hourly request limit while a queue was open
---
# ITM-479 Many files are read in one request

**REGISTER**

## Outcome

Building the trace graph of a repository — for an opened SPEC entry's impact list, the specification browser, the gaps —
reads its files in a handful of requests instead of one request per file. MOD-repository-hosts' snapshot offers
`readMany`, which reads many files ahead of their `read`s where the server allows it — on GitHub with a token, through
the same server's GraphQL API —, and MOD-trace-graph names every path it will read to the source's `readMany` before it
reads them, as their module files state.

Measured on this repository: one trace graph reads 1,332 files; with a token, each is one request today.

## Acceptance

- Every claim about GitHub's GraphQL API that the code relies on — how many files one query may name, how a large or
  binary file answers, how its rate limit counts, that the token reaches it — is read from GitHub's documentation and
  checked against a known positive before it is relied on; a file the batch could not give is read on its own.
- On any other server, in a clone or without a token, nothing is read ahead and each `read` behaves as before.
- A regression test counts the requests of one trace graph over a fixture host of this repository's size, written and
  seen failing before the production change, with its planted-fault counterproof.
- A used-up limit is still named, never blamed on the token.

## Intake Decision

Registration only. It changes the interfaces of MOD-repository-hosts and MOD-trace-graph, whose module files are open for
akmaier's acceptance, and MOD-repository-hosts is changed by ITM-476 while Team 2's Sprint 62 holds it.
