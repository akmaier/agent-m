---
id: ITM-878
title: The Spec page shows the changes waiting for acceptance, then the SPEC; the history opens on request
level: module
realises:
  - UC-006
  - UC-018
modules:
  - MOD-trace-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-18 on the Spec page's layout, relayed by scrum-master-opus
---
# ITM-878 The Spec page shows the changes waiting for acceptance, then the SPEC; the history opens on request

**REGISTER**

## Outcome

akmaier: "On the page Spec: "SPEC changes" are the least interesting on the page. This reads like a log and can be moved
to an extra page. What I want to see on the Spec Page: Are there any changes to accept? If no omit; If yes: which ones?
Next, I want to see the spec. The History of spec changes is of minor importance and can move to another page that can be
opened at request."

**What draws the Spec page today.**
- `#spec` goes to MOD-review-pages' route `spec-entry` (`src/site-frame/dashboard-app.mjs:583`). That route is the list
  titled "SPEC changes" (`src/review-pages/kinds.mjs:30`): every entry of every change queue with its status, the
  accepted ones too.
- The SPEC itself is MOD-trace-pages' view `specification` (MOD-trace-pages.md:111).

**What the texts state, quoted.**
- MOD-review-pages.md:171: "`<k>` — the files of the kind with their status — open, accepted, changed since acceptance
  —, each with a tick." For the SPEC entries, that is the log akmaier means.
- MOD-trace-pages.md:111, the view `specification`: "every requirement once with its status — in SPEC, change proposed,
  removal proposed, proposed — …". It names no section of the changes waiting for acceptance above the SPEC.
- MOD-site-frame.md:133-134, `startPage`: "A fragment that names no loaded route shows the first route of its menu
  entry". No text says which route is the first of the entry Requirements, or that the list of entries opens only on
  request.
- MOD-trace-pages' Uses already name `MOD-spec-changes.queues` and `MOD-approvals.statuses`, which give the waiting
  entries.

**So the layout is not stated, and it needs akmaier's acceptance.** It is new, not restored. The drafts for akmaier:
- **MOD-trace-pages.md:111**, the view `specification`, at its start: "first, only while an entry of a change queue waits
  for acceptance, those entries, each with its status and a link to it (MOD-review-pages' `spec-entry/id=…`), and
  nothing where none waits; then".
- **MOD-trace-pages.md**, the same row's links: "*History of SPEC changes*, which opens MOD-review-pages' list
  `spec-entry`".
- **MOD-site-frame.md**, `startPage` or the menu: "the entry Requirements opens MOD-trace-pages' view `specification`
  first; the list of SPEC change entries is opened from it".

MOD-site-frame is held by team 2's ITM-725 and MOD-review-pages by ITM-728, so the drafts go into the module files once
those holds end. They are written here so that akmaier can accept them at once. This item is apart from the regression
items ITM-874 to ITM-877.

## Acceptance

- The Spec page shows first the SPEC change entries that wait for acceptance, each linked, and no such section when none
  waits; below them, the SPEC. A test checks both cases, with a counter-proof.
- The list of all SPEC change entries opens from a link on the Spec page, and not before. A test checks it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
