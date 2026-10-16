---
id: ITM-511
title: Recording conversations is switched on the settings page
level: module
realises:
  - UC-042
  - UC-049
  - SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
  - ITM-503
  - ITM-506
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-settings-pages, Interfaces: view (`settings`, each route's subject)
---
# ITM-511 Recording conversations is switched on the settings page

**REGISTER**

## Outcome

The instance's section holds *Recording conversations*, *off* unless switched on. Switching it on first states what
follows and names each repository its server reports as public. It saves `docs/conversation-recording.md` only after
*I have read this*. Switching it off is saved without a notice, and the page says that written records stay. Each route
gives the subject of the kind `converse`, naming each setting and its state and never a value.

The readings, settled from MOD-settings-pages (Interfaces, `settings`), UC-042 step 3 and 3b, MOD-prompt-bar's recording
switch, and the existing code of `src/settings-pages/settings.mjs`:
- **The state.**
  - The line shows `on` or `off`, as MOD-prompt-bar's `recordingOf` reads the instance's snapshot (`src/prompt-bar/record.mjs`).
  - A missing file or key is `off`.
  - MOD-settings-pages' Uses list `recordingOf` and `recordingSchema`.
- **Switching on.**
  - *Switch on* shows the notice before anything is saved. It states UC-042 step 3's three statements:
    - every message, the person's and the participant's, will be committed to the repository of the page the
      conversation is held on, under `docs/conversations/`;
    - it stays in that repository's history;
    - for each repository the server reports as public, the conversations held on its pages will be published.
  - **Which repositories are named.** The instance's repository, and each product this browser keeps (the setting
    `products`, as `productListControls` reads it). For each, `repositoryInfo()` is asked with the credentials the page
    already uses for it (`credentialsFor`), and every one whose `visibility` is `public` is named.
  - **A repository whose information cannot be read** is named as such, "visibility not known", and never as private.
    The notice must not leave out a repository that may be public.
  - *Save* is enabled only once *I have read this* is ticked, and acts only on a person's click (`event.isTrusted`, as
    *Install* does).
- **Switching off.**
  - *Switch off* saves at once, without a notice.
  - The page then says that records already written stay in the repositories' history (UC-042 3b).
- **What is saved.**
  - `docs/conversation-recording.md` in the instance repository, with the front matter `recording: on` or
    `recording: off` and the title line `# Recording of conversations`, as `recording.schema.md` states.
  - It is written with MOD-artifact-edits' `saveFile` on the instance's host, as the page already saves the
    product's settings (`saveFile(host, { path, text, openedBlob })`).
- **The explanation.** The line has its folded explanation, as every line of the page has ("Each section and line has its
  folded explanation"). Its topic `recording-conversations` is added to MOD-site-frame's `src/site-frame/explanations.md`.
  It says what the switch does, where records go, that public repositories publish them, and that switching off keeps
  what was written.
- **The subject.**
  - The settings routes keep the frame's default subject. It is of the kind `converse`, and its page is the
    `textContent` of what the route drew, which holds no input's value (`src/site-frame/subject.mjs`). So a stored
    secret, shown only in a field, is never part of it.
  - The item adds no subject of its own. It shows by a test that a fixture token's value is not in `paramsFor().page`,
    also after *Show*.

No existing test's expected result changes.

## Acceptance

- **Nothing is saved before the notice.** In a small DOM with a fixture host, nothing is saved before *I have read this*
  is ticked and *Save* pressed.
- **The notice names repositories by their visibility.** It names a fixture public product, and the instance where it
  is public. It does not name a private one, and it names an unreadable one as "visibility not known".
- **Switching off** saves `recording: off` without a notice and says that written records stay.
- **The saved file** follows `recording.schema.md`.
- **No stored value in the subject.** No subject holds a stored value, also after *Show*.
- **The explanation topic** `recording-conversations` exists and is shown on the line.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
