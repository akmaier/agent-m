---
id: ITM-966
title: The replies page lists the issues to answer, shows an issue's mails with their drafts, and drafts the replies
level: module
realises:
  - UC-039
  - CLOSING AN ISSUE PREPARES ITS REPLIES
  - THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-953
  - ITM-954
  - ITM-581
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-039-1, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-966 The replies page lists the issues to answer, shows an issue's mails with their drafts, and drafts the replies

**REGISTER**

## Outcome

MOD-maintenance-pages is accepted at `acdb0521`, and `src/maintenance-pages/` does not exist. This item builds its part
`replies.mjs` and adds two of its routes to the `view` of `index.mjs`. If no other item of the module has created
`index.mjs` yet, this item creates it. Those items are ITM-582 (route `issues`) and UC-038's `mail` route item, NEW-038-n;
whichever is merged first creates the file.

MOD-maintenance-pages.md:117-119: "`replies`, `replies/<issue>` — closed issues with mails to answer, answers received,
open issues; an issue with what solved it and each listed mail found in the mailbox with its draft; *Draft replies* with
its run panel, or a reply written without a participant; each draft complete — recipient, subject, body, attachments —
and editable".

UC-039.md:78-96 gives steps 1 to 4, and the alternative flows 2b, 3a and 4a (UC-039.md:135-141, 160-161).

The data comes from MOD-mail-handling's `repliesDue` and `storeReplies` (ITM-953) and the kind `draft-replies` with the
recipe `reply-inputs` (ITM-954). Drafts are edited through `Mailbox.updateDraft` and `showDraft`, which are built
(`src/mail-routes/graph-route.mjs:318-333`, `bridge-route.mjs:86-87`). The participants are those `eligible` names at
places the mailbox allows.

## Acceptance

- Unit tests that name MOD-maintenance-pages, over fake `repliesDue`, a fake mailbox and a fake runner:
  - the three groups are drawn, and a closed issue with an unnoted mail is under *to answer*;
  - `replies/<issue>` shows the closing pull request and the release, and each mail with reporter, date, subject and its
    draft;
  - a mail with `mail: null` says *not found in the mailbox* and offers no *Send*;
  - a mail without a reply address is marked *not sendable*;
  - *Draft replies* offers only participants at places the mailbox allows, and its run panel names what the participant
    receives;
  - a reply without a participant opens an empty draft with the quoted original;
  - an edit of a draft is saved to the draft.
- Counter-proof: a page that offers a participant at a place the mailbox does not allow fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and the tests that name MOD-maintenance-pages change.
