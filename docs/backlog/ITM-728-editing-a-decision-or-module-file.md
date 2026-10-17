---
id: ITM-728
title: Editing an architecture decision or a module file on the dashboard
level: module
realises:
  - UC-023
  - EDITS ARE PREPARED ON THE DASHBOARD
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A REFUSED SAVE KEEPS THE EDIT
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-728 Editing an architecture decision or a module file on the dashboard

**REGISTER**

## Outcome

UC-023 step 1, route **Edit**. MOD-review-pages states `<k>/<id>/edit` for every kind whose save is `file`, the
decision and the module among them (its table, Data). Only the use cases' descriptor has `save: "file"`
(`src/review-pages/kinds.mjs`), so `decision/<id>/edit` and `module/<id>/edit` do not exist.

This item gives both descriptors the save `file` and their marks — the decision or module schema of MOD-documents and
`graphFindings` —, so that the routes work as ITM-358 built them for use cases: the editor with live preview, Mermaid
included; marks that do not block *Save*; *Save* through `saveFile` on the opened blob; a changed `id` disabling *Save*
with the reason; a refused save keeping the edit beside the newer text; GitHub's pages without a token, none on GitLab.
The saved file is then *changed since acceptance*. *Check this edit* is ITM-731.

## Acceptance

- In a small DOM with a fixture decision and a fixture module file: an edit saved in one commit and shown as changed
  afterwards; a mark shown with *Save* offered; a changed `id` refused; changed meanwhile kept beside the newer text;
  without a token, a link without text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
