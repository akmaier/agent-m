---
id: ITM-1286
title: The frame names the files its own parts add to a route's folders
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
  - MOD-prompt-bar
builds_on:
  - ITM-1266
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-1266 (PR #1388), docs/gates/20261029-0142-development-release-testing-2ddc.md, point 2
---
# ITM-1286 The frame names the files its own parts add to a route's folders

**REGISTER**

## Outcome

Since ITM-1266 a page's snapshot holds only the files of the route's folders (MOD-site-frame.md:180-182). The prompt bar
reads `docs/participants.md` and `docs/conversation-recording.md` through the page's snapshot (MOD-prompt-bar.md:309),
so on the instance's own page the frame adds these two files to every route's folders (`BAR_FILES` in `foldersOf`,
`src/site-frame/dashboard-app.mjs`). No text gives that addition: it is a case of its own (AGENTS.md §2 principle 5).
MOD-site-frame states which files the frame's own parts add to a route's folders, and the code follows that text.

This item waits for a draft of MOD-site-frame (and MOD-prompt-bar, if its reading changes) for akmaier's acceptance.

## Acceptance

- The accepted module text names the files the frame's parts add, and `foldersOf` takes them from where the text says,
  with no list of its own that the text does not give.
- Only `src/site-frame/`, `src/prompt-bar/` and their tests change.
