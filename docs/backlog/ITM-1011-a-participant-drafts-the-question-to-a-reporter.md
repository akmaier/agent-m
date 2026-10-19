---
id: ITM-1011
title: A participant drafts the question to a reporter
level: module
realises:
  - UC-039
modules:
  - MOD-job-catalogue
  - MOD-mail-handling
  - MOD-maintenance-pages
builds_on:
  - ITM-968
  - ITM-954
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-039-4, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1011 A participant drafts the question to a reporter

**REGISTER**

## Outcome

UC-039-close-or-defer-an-issue-and-reply.md:150-152: "On an open issue, the author presses **Ask the reporter**; a
question is drafted (by a participant or by hand), shown complete as in step 4, and sent with **Send and wait**". ITM-968
builds the question written by hand. The kind file of `draft-replies` drafts only replies
(`src/job-catalogue/kinds/draft-replies/kind.md:22`: "Drafts one reply per mail of a closed issue").

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-job-catalogue.md:107-107:

> | `draft-replies` | UC-039 | draft text | | `reply-inputs` | | | | `none` · `mail-drafts` | one reply per mail of a closed issue; or, with the parameter `question` — the person's point to ask —, one question to the reporter of a listed mail of an open issue (UC-039 1a) |

MOD-mail-handling.md:126-129:

> - recipe `reply-inputs` — for drafting replies: the issue, what solved it — the closing pull request or commit, and the
>     release that contains it, where known —, and each listed mail without a reply. With the parameter `question`, for an
>     open issue: the issue, the person's point to ask, and the one listed mail the question answers (UC-039 1a).
>   - writer `mail-drafts` — the drafted texts stored as drafts through `storeReplies`; it sends nothing.

MOD-maintenance-pages.md:121-123:

> the reporter* — a question drafted with *Draft question*, the run panel of `draft-replies` with the person's point as
>     its parameter `question`, or written by hand — and *Send and wait*; removing the label `waiting-for-reporter`; *Reopen* and *Leave closed* for a mail
>     that arrived in a closed issue's thread; *Close and reply*.

## Acceptance

- Once the architecture names the kind and its recipe, a participant's question for an open issue is stored as a draft
  and sent only as ITM-968 sends it.
- The first commit holds only the tests. No stub is committed.
