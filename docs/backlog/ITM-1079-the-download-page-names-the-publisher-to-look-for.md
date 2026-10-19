---
id: ITM-1079
title: The download page names the publisher to look for
level: module
realises:
  - UC-044
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-1047
tests:
  - unit
origin:
  - ITM-1047's gate on pull request #1071 (sprint team1/95), from developer-sonnet-b's reading
---
# ITM-1079 The download page names the publisher to look for

**REGISTER**

## Outcome

UC-044 step 2 (UC-044.md:66-69): the folded **Why this warning?** on the download page "shows the publisher's name to
look for". The explanation `bridge-signed-warning` (`src/site-frame/explanations.md:499-501`) says "check that it is the
publisher this page names". ITM-1047's route `bridge` names no publisher, because no accepted text gives the page a source
for the publisher's name. MOD-settings-pages.md:198-199 names the file, its size and its SHA-256 only.

**First task:** read whether an accepted text gives the publisher's name to MOD-settings-pages, for example through the
release that MOD-repository-hosts' `listReleaseAssets` reads or through MOD-bridge-build. Where none does, the item stops,
and the line it needs goes to akmaier as a draft.

## Acceptance

- The route `bridge` names the publisher of the release beside its file, and **Why this warning?** names the same one. A
  test shows it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
