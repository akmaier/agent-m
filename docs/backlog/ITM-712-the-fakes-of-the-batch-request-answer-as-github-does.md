---
id: ITM-712
title: The fakes of the batch request answer as GitHub does
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-677
tests:
  - unit
origin:
  - ITM-677's pull request #732 (sprint team1/73), from developer-sonnet-e's finding
---
# ITM-712 The fakes of the batch request answer as GitHub does

**REGISTER**

## Outcome

In ITM-677, the fake `POST /graphql` of `tests/spec-changes-fallback-requests.test.mjs` answered every batch with an
empty repository. The batch then read nothing, the files fell back to single reads, and the test counted a load that
does not happen on GitHub.

Eighteen test files serve `/graphql` (`git grep -l graphql -- tests` on `01bca866`). At the start, each fake is read
against the answer GitHub gives, and every one that answers empty or wrong is listed. They are then served by one fake,
in a helper of its own (sprint 56's agreement), and each file uses it.

Each file is changed by the job of its module. A file that belongs to no module waits for the job that moves it (sprint
72's agreement).

## Acceptance

- Every listed fake answers a batch with the texts of the files it holds, as GitHub does.
- Its counter-proof: a fake that answers empty makes the shared helper's own test fail.
