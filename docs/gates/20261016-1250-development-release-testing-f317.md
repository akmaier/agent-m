---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - abec5c433cf286631dc5182c0e81c39d26a3b129
  - https://github.com/akmaier/agent-m/pull/579
date: 2026-10-16 12:50 UTC
---
# Development → Release testing: sprint team1/42, between jobs: the site frame loads its views in the no-backend check

**REGISTER**

## Reason

The change between jobs decided in `docs/backlog/sprints/team1/42.md` ("Change between jobs"), pull request #579 into
`sprint/team1/42`, at head `abec5c43`. developer-sonnet-e made it, and built no part of ITM-531. For a change between
jobs, checks 1, 3 and 5 give way to one check: each change is one of the kinds `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`
names.

- **The kind.** The pull request changes only `tests/test_no_backend.py`, a check of the whole repository whose header
  names no module.
  - It adds one entry, `("src/site-frame/routing.mjs", "import()")`, with a count of one, and its evidence
    `_site_frame_view_import`.
  - The evidence requires the argument to be `viewAddress(slug)`, and the file to hold exactly one `viewAddress`,
    resolving `` `../${slug}/index.mjs` `` against `import.meta.url`.
  - MOD-site-frame's file states that `start.mjs` "loads the named view modules from their folders". This is the kind
    "lets a check of the whole repository allow a module what the module's file states that it uses".
- **CI is green on the head**: ten of ten jobs. The pull request is mergeable.
- **The new test.** It states its values in its own text, and is itself the counter-proof:
  - the frame's own form gives no finding;
  - another address, or a `viewAddress` against `location.href` or another origin, gives the finding at the `import()`;
  - a second `import()` gives the count finding;
  - the same text in another module's folder gives the finding.
  The developer ran the same on #577's real `routing.mjs`. With the old test file, the merge with #577's head fails exactly
  at `routing.mjs:74`; with this one, it passes, 22 tests.

Noted for the retrospective: one file was written outside the scratchpad and removed at once.
