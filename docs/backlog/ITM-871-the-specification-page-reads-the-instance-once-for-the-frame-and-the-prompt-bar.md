---
id: ITM-871
title: The specification page reads the instance once, for the frame and the prompt bar
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
  - MOD-prompt-bar
builds_on:
  - ITM-867
tests:
  - unit
origin:
  - ITM-867's pull request #827 (sprint team1/82), from developer-sonnet-c's finding
---
# ITM-871 The specification page reads the instance once, for the frame and the prompt bar

**REGISTER**

## Outcome

After ITM-867, MOD-trace-pages reads the instance once per load. On the specification page the frame still reads the
instance's repository information, commit and tree: three requests, beside the prompt bar's own three. This was measured
with ITM-867's probe. The two modules share the one snapshot of the load, through the interfaces their files name. If no
interface hands it across, a draft comes first. The start counts the page before and after, with a token and without.

## Acceptance

- The specification page reads the instance's commit and tree once per load, counted by a test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
