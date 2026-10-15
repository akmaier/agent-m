---
id: ITM-478
title: The SPEC entries list reads every artifact once per entry
level: system
realises:
  - UC-006
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
  - component
  - system
  - release
origin:
  - akmaier's report that the dashboard used up the account's hourly request limit while a queue was open
---
# ITM-478 The SPEC entries list reads every artifact once per entry

**REGISTER**

## Outcome

Opening the list of SPEC change entries costs a handful of requests to the repository server: the list's ticks are
built from the blobs they name, and an entry's impact list is built only when that entry is opened.

The failure path, measured on this repository with a snapshot that counts its reads:

- MOD-review-pages, `queueService.groups` in `src/review-pages/spec-entries.mjs` — calls `entryView` for every entry a
  person may tick, only to obtain the proposal's blob and the current section's blob for the tick (`shownOf`).
- MOD-spec-changes, `entryView` in `src/spec-changes/accept.mjs` — always computes `impactOf`, which builds `traceGraph`
  of the whole snapshot.
- MOD-trace-graph, `traceGraph` in `src/trace-graph/build.mjs` — reads every file one of its readers selects, one `read`
  after another.
- MOD-repository-hosts, the snapshot's `read` in `src/repository-hosts/index.mjs` and the GitHub adapter's `readFile` in
  `src/repository-hosts/github.mjs` — with a token, each read is one `GET /repos/{owner}/{name}/contents/{path}` request;
  the texts are kept only for the life of the page.

Actual: a queue of three entries makes `groups` call `read` 4,123 times on 1,438 distinct files, about 1,400 requests to
the API per load of the list, so a few reloads use up the 5,000 requests an hour of the account. Expected: the list reads
the SPEC once and takes each proposal's blob from the tree it already holds; it builds no impact list. Batching the reads
an opened entry still needs is ITM-479.

## Acceptance

- The list's tick of an entry names the proposal's blob from the queue's tree and the current section's blob from the
  SPEC read once with `sectionText` and `blobSha`, as MOD-review-pages' route `<k>` states; acceptance through the ticks
  still writes the records `acceptEntries` writes for the blobs shown.
- An opened entry still shows its full impact list (`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`).
- A regression test at the failure node counts the reads `groups` makes on a fixture queue over a fixture of this
  repository's size, written and seen failing before the production change, with its planted-fault counterproof.

## Intake Decision

Registration only. akmaier asked for the fix. ITM-476, held by Team 2's Sprint 62, changes MOD-repository-hosts, whose
interface MOD-review-pages uses; `SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES` keeps this item out
of another team's sprint while ITM-476 is held. It is selectable once ITM-476 is merged.
