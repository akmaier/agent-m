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

The draft adds `refine` to `runOnTab`'s hooks, with what it is for, in MOD-runtimes.md. No code changes. It is written
after `58e6f89c`, the draft of `from` on the same lines, is decided, so that the two do not change one sentence at once.

## Acceptance

- Once the draft is accepted, `runOnTab`'s hooks in MOD-runtimes' text are those its code takes.
