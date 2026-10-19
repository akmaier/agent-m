---
id: ITM-1039
title: A model or data pinned to a branch name is named, as a repository is
level: unit
realises:
  - UC-040
  - A RESOURCE IS PINNED TO AN EXACT STATE
modules:
  - MOD-resource-list
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-3, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1039 A model or data pinned to a branch name is named, as a repository is

**REGISTER**

## Outcome

UC-040.md:168-169 (3b): "The author pastes the revision from the Hub's *Files and versions* page; Agent M accepts only a
full commit hash, not a branch name such as `main`." MOD-resource-list.md:89-90: `resourceFindings` checks "the pin's form
for the kind — a full commit, not a branch name such as `main` —", and its Data (:58) pins data and a model to "a revision
or the SHA-256 of every file".

`src/resource-list/rules.mjs:49-51` checks the form for a repository only. Measured at `8bc49c6f`: `resourceFindings` of an
entry pinned to `main` gives `A RESOURCE IS PINNED TO AN EXACT STATE` for a repository (the known positive) and nothing for
a model or for data.

**Reading taken (AGENTS.md §6a.6):** a revision on the Hub is its 40-hex commit, so a data or model pin is a 40-hex
revision, or the per-file SHA-256 map the Data names. If the developer finds the schema's language cannot hold the map, the
item stops and reports it.

## Acceptance

- A model and a data entry pinned to `main`, a seven-digit abbreviation or a tag each give an error naming the rule, the
  resource and the pin; a 40-hex revision gives none. Counter-proof: the repository cases of TST-472587 stay as they are.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/resource-list/` and the tests that name MOD-resource-list change.
