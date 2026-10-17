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

**Settled at sprint team1/68's start. Selectable. ITM-660 is folded in**, by sprint 67's agreement on module headers.
- **The modules whose files it changes:**
  - MOD-source-register: `index.mjs`. `registrationCommits` (:103) and `versionCommits` (:191) take a file's `note` and
    throw `NoteMissing { name }`. `filesCell` (:142-146) and the line at :117 write the note beside the unstored file's
    name. Its header (:1-10) loses its item history and its no-longer-true sentence, which is ITM-660.
  - MOD-settings-pages: `library.mjs`. Beside "Only hash it" (:330-334), the form asks where the copy is kept. A
    hash-only file without a note is refused by name, through the module's `NoteMissing`, not a check of the page's own.
  - No topic is added: the existing `explain("file-only-hashed")` (`library.mjs:191`) stays.
- **The grep, full output read:**
  - `grep -rn "not stored:" src tests` finds `index.mjs:96, 117, 146` and `content.mjs:25-27`, which reads the cell back.
  - Also the comment `library.mjs:18`, and `tests/source-register-registration.test.mjs:18, 147`.
  - `content.mjs`'s reading of the cell is read at the developer's draft run. If the note changes what it reads, it is
    named, and kept so that `filesOf` still finds each file unstored.
- **Reads, against the token budget:** none. The commit plan is the same one.
- **No measurement is claimed.**
- **Reachable** through MOD-site-frame's route `library`.
- **Sprint 64:** the developer runs the modules' tests and their callers', release tests included, on a draft, and lists
  every changed one before the tests-only commit.
- **Sprint 65:** DOM assertions compare a boolean or a string.
- **Sprint 66:** no refusal is worked around.
- **Sprint 67:** each shell command does one action, and a module header it touches loses its item history.

## Acceptance

- The library form asks for the note when a file is only hashed, and the register entry holds it.
- A hash-only file without a note is refused by name.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-source-register's `note` of a file not kept and `NoteMissing` (accepted blob de89c5f23334). It is free of drafts; its readings are read at its start.
