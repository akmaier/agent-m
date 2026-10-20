---
id: ITM-1142
title: The places of the restricted sources are one function of the source register
level: module
realises:
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
modules:
  - MOD-source-register
  - MOD-prompt-bar
  - MOD-review-pages
builds_on:
  - ITM-1123
tests:
  - unit
origin:
  - po-opus-b's gate of #1167 (ITM-1123), with architecture-reviewer a2fd6f0bd4f5027fd, sprint team2/97
---
# ITM-1142 The places of the restricted sources are one function of the source register

**REGISTER**

## Outcome

MOD-job-runner's `JobContext.places` (MOD-job-runner.md:204-213) is computed twice, with different scopes:
- `placesOf` in `src/review-pages/jobs.mjs:458` takes the sources the product links, and gives no `contents`;
- `restrictedPlaces` in `src/prompt-bar/places.mjs` (#1167) takes every entry of the instance's register, and gives
  `contents` as `docs/sources/<id>` of the product.

That is one rule in two copies (AGENTS.md §2, principle 2). Its home is MOD-source-register, which owns the register and
`permittedPlaces`. It needs a draft for akmaier, which settles two things:
- **Which scope is right:** the linked sources only, or every restricted entry. The prompt bar's tools read any path of
  the product, which speaks for every entry.
- **Where `contents` lies.** MOD-source-register.md:99-101 keeps a restricted version's content in its content
  repository, never in the product's `docs/sources/`. So #1167's path names files that normally do not exist: it refuses
  more, never less. The function takes the paths from where the content actually lies.

## Not ready: a draft for akmaier

MOD-review-pages.md is held by the precompile draft `9a2c9f4a`, and two drafts do not edit one file at once. The draft is
written once akmaier has decided that one.

## Acceptance

- One function of MOD-source-register gives `places.sources` and `places.contents`. The prompt bar and the review pages
  take it, and neither keeps a copy. Counter-proof: a restricted source whose licence allows the processing place is read.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft is on `main` as `1cabcbff`** (MOD-source-register, MOD-prompt-bar and MOD-review-pages), written in sprint team1/98. The item is built once it is accepted.
