---
id: ITM-915
title: The explanation of a new version fits a repository source
level: module
realises:
  - EVERY STEP EXPLAINS ITSELF
  - UC-016
modules:
  - MOD-site-frame
builds_on:
  - ITM-705
tests:
  - unit
origin:
  - developer-sonnet-a's finding on ITM-705's pull request #884 (sprint team1/89)
---
# ITM-915 The explanation of a new version fits a repository source

**REGISTER**

## Outcome

The topic `source-new-version` (`src/site-frame/explanations.md:546-549`) tells the person to select the version's files.
A repository source's new version records the commit read, with no files, since ITM-705 (`versionCommits` with
`version.commit`, MOD-source-register.md). So the explanation is wrong for that route. developer-sonnet-a left it
unchanged on #884, because the topics are MOD-site-frame's.

## Acceptance

- `source-new-version` says what a new version of each kind of source records, files for documents and the commit read for
  a repository, and the library's panel shows it. A test checks the topic's text against the route, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
