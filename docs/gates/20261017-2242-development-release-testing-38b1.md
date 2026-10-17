---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 532af4b932ecab6e28ab7c9112713de48a99b8f4
  - https://github.com/akmaier/agent-m/pull/802
date: 2026-10-17 22:42 UTC
---
# Development → Release testing: ITM-812, the process page groups the catalogue's models by their kind

## Reason
The condition of the rejection on 140e8847 (record `20261017-2239-development-release-testing-b793.md`) is met. The
rework `532af4b9` adds one file, `tests/implementation-pages-process-groups-data.test.mjs`, and changes nothing else; it
is a file of its own because a module tree loads once per file. Its header names MOD-implementation-pages and UC-002 /
THE CATALOGUE IS DATA under ITM-812; it holds its fixtures (a planned and a pulled model file, served through
`shipped.md` as TST-472409 does) and its one test, TST-812006. Replayed: the fault that fills Plan-driven with the first
three shipped models and Agile with the rest, ignoring `kind`, fails TST-812006 and only it; the red commit's
`process.mjs` fails it too; restored, all six tests pass. CI is green on the head (run 39076042431). Checks 1–4 hold as
recorded on 140e8847.
