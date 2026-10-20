---
id: ITM-1153
title: MOD-runtimes's text names `runOnTab`'s hook `refine`, which its callers pass
level: module
realises:
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-a's finding at ITM-1115's stop (sprint team1/97)
---
# ITM-1153 MOD-runtimes's text names `runOnTab`'s hook `refine`, which its callers pass

**REGISTER**

## Outcome

`runOnTab` takes a hook `refine` (`src/runtimes/tab.mjs:138`) and hands it to MOD-job-runner's `runJob`
(`src/runtimes/tab.mjs:170`). The review pages pass it (`src/review-pages/jobs.mjs:189`). MOD-runtimes' text lists the
hooks `host`, `record`, `onOutput` and `signal` (MOD-runtimes.md:186-192), and no `refine`. So the text lacks an
interface its code gives and its callers use, and no code is wrong.

## Not ready: a draft for akmaier

The draft is `56c4078d`, on `main`, by developer-sonnet-c. It adds `refine` to `runOnTab`'s hooks in MOD-runtimes.md,
with what it is for. No code changes.

## Acceptance

- Once the draft is accepted, `runOnTab`'s hooks in MOD-runtimes' text are those its code takes.

**Read at sprint team1/98's start (po-opus): done.** akmaier accepted the draft `56c4078d` (`cfb0a5d7`). MOD-runtimes'
text now names `refine` among `runOnTab`'s hooks, which its code takes (`src/runtimes/tab.mjs:138`). No code changes.
