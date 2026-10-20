---
id: ITM-649
title: A guards entry names a requirement or a use case and nothing else
level: module
realises:
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - EVERY ARTIFACT NAMES ITS ORIGIN
modules:
  - MOD-test-document
builds_on:
tests:
  - unit
origin:
  - ITM-597's gate on pull request #690 (docs/gates/20261017-0533-development-release-testing-7f40.md), from developer-sonnet-d's measurement
---
# ITM-649 A guards entry names a requirement or a use case and nothing else

**REGISTER**

## Outcome

MOD-test-document's declaration (Data): `guards` holds "the requirements it guards by name, or use cases by
identifier, separated by `;`". Many test headers write a use case with its step, such as `UC-005 (alternative flow 6a)`.
The trace graph then reads 522 names on this repository that match no requirement, and nothing reports the malformed
entry.

Which way this goes is read at the start, against MOD-test-document's file and `A REFERENCE NAMES THE IDENTIFIER, NOT THE
POSITION`:
- `testDeclarations` reports such an entry as a finding;
- the headers lose their parenthesised steps, in the items of the modules whose tests they are.

## Acceptance

- A `guards` entry that is neither a requirement's name nor a use case's identifier is a finding, naming the test and the entry.
- Its counter-proof is a bare identifier, and it gives no finding.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Stopped at its first task (sprint team1/100, developer-sonnet-d):** MOD-test-document's `testFindings` names no
malformed `guards` entry. The draft of MOD-test-document.md, by developer-sonnet-d, adds the error (A REFERENCE NAMES THE
IDENTIFIER, NOT THE POSITION) and the use of MOD-identifiers' `kindOfIdentifier`. The finding is an error from the start.
The item cleans the headers it finds; those of release tests are cleaned by another participant in a commit of its own.
The item waits for the draft's acceptance.

