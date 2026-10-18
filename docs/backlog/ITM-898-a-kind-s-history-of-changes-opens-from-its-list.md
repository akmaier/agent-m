---
id: ITM-898
title: A kind's history of changes opens from its list
level: module
realises:
  - UC-008
  - UC-023
modules:
  - MOD-review-pages
builds_on:
  - ITM-879
tests:
  - unit
origin:
  - ITM-879's stop (sprint team1/87), from developer-sonnet-d's reading
---
# ITM-898 A kind's history of changes opens from its list

**REGISTER**

## Outcome

MOD-review-pages.md, as akmaier accepted it (`257db304`):
- `<k>` ends "and a link to `<k>/history`";
- `<k>/history` is "the history of the kind's changes: its approval records, newest first, each with the file it names,
  the person who committed it and the date; opened only from the link on `<k>`".
No function in MOD-review-pages' Uses gives the committer and the date of a record. MOD-repository-hosts' `readHistory`
does (`HistoryEntry`: `author`, `date`, `changes`; MOD-repository-hosts.md:117-118, :177). So a draft adds it to
MOD-review-pages' Uses, "on `<k>/history` only", committed for akmaier with this item. developer-sonnet-d found this at
ITM-879's stop.

**The address** follows the module's other routes: `<k>/history` in the text is `#<route>/id=history` in the address, as
`<k>/all` is `#<route>/id=all`. ITM-878's *History of SPEC changes* opens `#spec-entry/id=history`.

## Acceptance

- `<k>` ends with a link to `<k>/history`, and that page lists the kind's approval records newest first, each with the file,
  the person who committed it and the date, through `readHistory`. Tests check this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- It waits for akmaier's acceptance of the draft in MOD-review-pages.md.

**Stopped before its go (sprint team1/89), for its request cost.** The red is confirmed (run 39121297141). The developer
measured one load at this repository's size, with a fake GitHub fed from git: 236 commits touched `docs/approvals/`.

| Page | Rows | With a token | Without a token |
|---|---|---|---|
| use-case | 181 | 244 | 423 |
| decision | 40 | 243 | 282 |
| module | 265 | 245 | 507 |
| spec-entry | 110 | 244 | 352 |

- 242 of each total are REST calls: three for the snapshot, three pages of commits, and one per commit for its changes.
- The cost grows with every acceptance ever made. Without a token, GitHub allows 60 calls an hour.
- `A PAGE LOAD READS THE REPOSITORY IN BATCHES` names commit, tree and file texts, not history, so it is not broken as
  worded. The accepted text names no bound, and the item will not add one by itself.
- **The draft for akmaier, on `main`:** MOD-review-pages' `<k>/history` reads twenty commits of `docs/approvals/` at a
  time, with *Older* for the next twenty from the parent of the last commit shown (`readHistory`'s `ref` and `limit`,
  MOD-repository-hosts.md:179). One page then costs the snapshot, one page of commits and twenty commits.
- The same draft names `MOD-approvals.approvalSchema` in the Uses, which the module's code already imports.
- **The reading of "its approval records" is accepted:** the records whose identifier names one of the kind's files on the
  default branch now, with the `spec-` prefix for SPEC entries. A record of a file that no longer stands is not listed.
- The PR stays open with its red tests. The item resumes once akmaier accepts the draft, and its tests gain the page of
  twenty and *Older*.

