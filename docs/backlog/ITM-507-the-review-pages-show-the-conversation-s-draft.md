---
id: ITM-507
title: The review pages show the conversation's draft
level: module
realises:
  - UC-019
  - UC-049
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - A CONFLICT IS DECIDED BY A PERSON
  - THE PERSON WHO PROMPTS IS A SOURCE
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-review-pages
builds_on:
  - ITM-478
  - ITM-485
  - ITM-493
  - ITM-504
  - ITM-506
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-review-pages, Interfaces: view (routes `<k>/<id>`, edit routes, `draft`)
  - sprint team1/47: cut — the old prompt routes are removed by ITM-551, after ITM-514 has moved UC-019's system and release tests off them
---
# ITM-507 The review pages show the conversation's draft

**REGISTER**

## Outcome

**The route `draft`** shows `latestDraft` for the subject the person came from, against the current text:
- files in the editor as their difference, a changed identifier restored first;
- requirements as `entrySections` composes them, beside the one each refers to, with an undecided conflict kept out;
- an architecture file with its rounds, its due diligence and its impact list.

It offers *Save* and *Discard*. *Save* saves as UC-018 saves, with provenance lines that name no message.

**Each file's and editor's route gives its subject.** It carries the descriptor's change kind, the target, and `draft` as
its draft route. For requirements, it also carries the person's own source.

The readings, settled from MOD-review-pages (Interfaces, `draft` and the routes' subjects):
- **The route.** `draft` is a route of the review pages' `view`, with `entry` `null`, since it is no menu entry.
- **What it reads.** It reads the draft with MOD-prompt-bar's `latestDraft(store, subject)`, for the subject the
  fragment names. Without a draft for that subject, it says that there is none and links back to the subject's route.
- **What it calls.** As the module's Uses list them:
  - `keptIdentifier` restores a changed identifier first;
  - `entrySections` composes the sections, and `proposeSection` saves each into the person's open queue of the day;
  - `saveFile` saves the files in one commit, only on the text the job read;
  - `provenanceLines` writes the trailers, which name no message;
  - `personSource` gives the person's own source for a change of requirements.
- **Without a token for GitHub**, GitHub's pages open, as the existing edit routes do.
- **The subjects.**
  - The routes `<k>/<id>`, `<k>/<id>/edit`, `requirement/<name>/edit` and `requirements/new` give a subject. Its kind is
    the descriptor's change kind, `change-requirements` for a requirement, and its draft route is `draft`.
  - For requirements, the subject's parameters carry the person's own source. Without one, the prompt bar names the
    missing step (UC-019 4b).
  - The other routes keep the frame's default.
- **Cut.** The routes `<k>/<id>/prompt`, `requirement/<name>/prompt` and `requirements/prompt`, and the links *Change by
  prompt*, stay in this item. UC-019's system and release tests still run through them. ITM-514 moves those tests to the
  prompt bar and `draft`, and ITM-551 then removes the old routes.

**One existing test's expected result changes:** TST-472605 (`tests/review-pages-architecture.test.mjs`). It lists the
view's route names, and `draft` joins them. No other test changes.

## Acceptance

- **Each kind of draft.** In a small DOM with a fixture draft for each kind — use case, architecture file, requirements,
  `converse` — the route shows it against the current text and saves it as stated.
- **Saving.** It refuses a save on a moved text and keeps the edit. *Discard* drops the draft.
- **The subjects.** Each route's subject is as stated, and a requirement's carries the person's source.
- **No requests leave.** The tests run under a `fetch` spy, and no request leaves the fixtures.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
