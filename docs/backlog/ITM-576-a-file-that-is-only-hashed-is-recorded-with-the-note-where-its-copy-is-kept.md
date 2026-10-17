---
id: ITM-576
title: A file that is only hashed is recorded with the note where its copy is kept
level: module
realises:
  - UC-004
modules:
  - MOD-source-register
  - MOD-settings-pages
builds_on:
  - ITM-455
tests:
  - unit
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-576 A file that is only hashed is recorded with the note where its copy is kept

**REGISTER**

## Outcome

UC-004 4a: "only designation and hash are recorded, with a note where the copy is kept". Hash-only registration is built (ITM-455), but the note has no field. MOD-source-register, Data, `## Versions`: "or a note where a copy that was only hashed is kept".

**The reading of 2026-10-17 (sprint team1/63): it waits for akmaier's acceptance of the draft committed with it,**
on MOD-source-register.
- Today the only note is the list of the files not stored (`filesCell`, `src/source-register/index.mjs:142-146`).
- The interface's `files` (`registrationCommits`, `versionCommits`) has no field for where a copy is kept.
- Giving the note a field in the form alone would leave the module unable to write it, and a refusal in the form alone
  would be missing from *+ New version*. So the draft gives both functions the note and the refusal, once (nothing
  twice):
  - a file with `keep: false` carries `note`, written beside its name in the Files cell;
  - without a note, the function throws `NoteMissing { name }`.
- **Reached** through MOD-site-frame's route `library`. The live page dispatches no `library`. It reaches it with the
  switch to `start.mjs`, as ITM-599 reads it.

## Acceptance

- The library form asks for the note when a file is only hashed, and the register entry holds it.
- A hash-only file without a note is refused by name.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
