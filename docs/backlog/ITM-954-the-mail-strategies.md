---
id: ITM-954
title: The recipes mail-batch and reply-inputs, and the writer mail-drafts
level: module
realises:
  - UC-038
  - UC-039
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
modules:
  - MOD-mail-handling
builds_on:
  - ITM-952
  - ITM-953
tests:
  - unit
origin:
  - akmaier's question of 2026-10-18 whether team 2 can work on topics independent of team 1
---
# ITM-954 The recipes mail-batch and reply-inputs, and the writer mail-drafts

**REGISTER**

## Outcome

MOD-mail-handling's part `strategies.mjs`: `mailStrategies` as MOD-mail-handling.md:118-127 states it (blob `be10efd1`).
- The recipe `mail-batch` gives "one part per chosen mail with its text, and the text of the attachments the person
  ticked for it; one part with the instance's products ...; one part with the titles and numbers of their open issues.
  Each mail's people go into the job's context for the check `people-search`, never into a part."
- The recipe `reply-inputs` gives the issue, what solved it, and each listed mail without a reply.
- The writer `mail-drafts` stores the drafted texts through `storeReplies`, and "it sends nothing".

## Acceptance

- Unit tests that name MOD-mail-handling: the parts of `mail-batch` for two mails hold no name of their people, and the
  job's context does; `reply-inputs` names the closing pull request and the release; `mail-drafts` calls `storeReplies`
  and never sends.
- Counter-proof: a recipe that puts the people into a part fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/mail-handling/` and the tests that name MOD-mail-handling change.
