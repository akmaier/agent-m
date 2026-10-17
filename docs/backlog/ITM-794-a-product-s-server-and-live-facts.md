---
id: ITM-794
title: A product's server facts and its jobs' live states, read once
level: module
realises:
  - UC-035
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-progress-measures
builds_on:
  - ITM-793
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-794 A product's server facts and its jobs' live states, read once

**REGISTER**

## Outcome

UC-035 step 1 and 1b. With the scope `all`, `productFacts` reads, once, the repository's information, the CI runs of the
default branch's head and the tags through the host, and the live state of every job that has not ended through
MOD-runtimes' `liveState` — from the CI service, the Bridges given and this tab —, as MOD-progress-measures' file states
it. A host that does no server operations leaves those facts `"unknown"`; a source of live states that cannot be read
leaves its jobs as their records say, marked as not reachable.

## Acceptance

- A fixture host and Bridge give the facts; a Bridge that does not answer marks its jobs not reachable, and the facts
  are still read; a local clone gives `"unknown"` for the server's facts.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
