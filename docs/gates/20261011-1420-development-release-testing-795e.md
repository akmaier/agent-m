---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - afbff097e8e278327d4e8f1f37d5f2756e84efc4
  - https://github.com/akmaier/agent-m/pull/365
date: 2026-10-11 14:20 UTC
---
# Development → Release testing: ITM-310

**REGISTER**

## Reason

ITM-310, pull request #365 by developer-sonnet-d into `sprint/team1/15`, on head `afbff09`, against the item and
MOD-repository-hosts' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `8759249`, holds only `tests/repository-hosts-file-pages.test.mjs`, and CI was red on it (run
  38146192716): node failed on exactly its 3 tests — 1393 tests, 3 failed.
- CI is green on the head (run 38146453506): node 1393 tests, 0 failed; python 441 tests, OK.
- Only MOD-repository-hosts' folder — `newFile` and `editFile` in `web-links.mjs` — and the new test whose header names
  the module change; no existing test or expected result changes, and the model in `docs/assets/git-host.mjs` stays.
- The 3 new tests name what they guard — `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK`, `NO TEXT TRAVELS IN A
  URL` and `A CREDENTIAL IS NEVER PLACED IN A URL` — and MOD-repository-hosts, with 22 planted faults recorded.
- The Acceptance holds: a new-file page with a path and a three-line record, whose address holds both and nothing else;
  an edit page of a path with spaces; `newFile` null for a GitLab project; no request made.

Noted for the sprint's review, no condition of this gate: the item's Outcome asks for "the new-file page of the default
branch", but MOD-repository-hosts' file gives `newFile` and `editFile` no branch and `webLinks` makes no request, so
the pages are built on `main`, the model's default, and a repository whose default branch has another name gets a page
for a branch it does not have. Giving the pages the default branch needs a change of the module file, a proposal for
akmaier. Also noted: the model's refusal of a record above 1000 characters is not carried over, as the Acceptance names
none, and GitLab's `editFile` is read as its single-file editor.
