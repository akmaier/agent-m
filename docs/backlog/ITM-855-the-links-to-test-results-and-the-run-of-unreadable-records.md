---
id: ITM-855
title: The links to test-results and to the run when the records cannot be read
level: module
realises:
  - UC-028
modules:
  - MOD-test-pages
builds_on:
  - ITM-760
  - ITM-889
tests:
  - unit
origin:
  - developer-sonnet-f's stop of ITM-760 in team 2's sprint 82, 2026-10-18
---
# ITM-855 The links to test-results and to the run when the records cannot be read

**REGISTER**

## Outcome

MOD-test-pages' route `runs/<commit>`, UC-028 2b: when the records cannot be read from the browser, for example a
private repository without a token, the page links to the branch `test-results` on the server and to the run of this
commit on the server.

The item waits for akmaier's decision on MOD-repository-hosts' `WebLinks`: a page for a branch, and where the run's
identifier comes from when nothing can be read. It cannot be settled from the accepted texts: `WebLinks`
(MOD-repository-hosts.md, Data) names `newToken`, `tokens`, `projectTokens`, `secrets`, `newFile`, `editFile`,
`actions`, `run(id)`, `pipelineSchedules`, `pagesSettings`, `fork` and `newRepository`, and no page for a branch. The
known positive: the same reading finds `run(id)` and `secrets` there, and `src/repository-hosts/web-links.mjs` builds
both. `run(id)` needs the run's identifier. In 2b the record that holds the run's address cannot be read, and
`listCiRuns`, `repositoryInfo` and `ciRunLog` each "fail as `readSnapshot`", so none of them gives it either.

The reading of developer-sonnet-f — match the address a record holds against `listCiRuns(...).url`, as
`src/runtimes/ci.mjs` `runOfAddress` does — is rejected for 2b: it needs the record and the list of runs, and in 2b
neither can be read. Where the records can be read, the record's address is the run's link already. ITM-760 gives the
server's page of runs, `webLinks().actions`, which needs no request.

## Acceptance

- With fake hosts whose reads fail as a private repository's without a token, the tests state the link to
  `test-results` and to the run.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), a module text change only

The question for akmaier in this item's Outcome: a `WebLinks` page for a branch, and where the run's identifier comes
from when nothing can be read. UC-028 2b: "links to the branch `test-results` and to the run on the server"
(UC-028:108-109). `WebLinks` (MOD-repository-hosts.md:144-147) has no branch page; `run(id)` needs an identifier that 2b
cannot read. No identifier is needed: the route `runs/<commit>` knows the commit, and both servers have a page of one
commit's runs, which needs no request.

**The draft**, committed as `c2f0a91e`: `WebLinks` gains `commitRuns(commit)`, the page of the runs or pipelines of one commit,
and `branch(name)`, the page of a branch's files; MOD-test-pages' use of `webLinks` names them. Principles: *one
responsibility* — server addresses stay in `web-links.mjs`; *no special first case* — the same entries on both servers.

ITM-889 builds the entries in MOD-repository-hosts; this item builds on it, since its Acceptance changes only
`src/test-pages/`. MOD-test-pages uses MOD-site-frame, which ITM-878 changes, so the item is held while team 1's sprint 87
runs.
