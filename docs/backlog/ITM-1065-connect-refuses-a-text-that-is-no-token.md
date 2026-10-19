---
id: ITM-1065
title: connect refuses a text that is no token of either server, and setup keeps no form of its own
level: module
realises:
  - DEVELOP AGAINST INTERFACES
  - UC-014
modules:
  - MOD-repository-hosts
  - MOD-settings-pages
builds_on:
  - ITM-1021
tests:
  - unit
origin:
  - ITM-1021's red (sprint team1/93), from the coordinator's reading of TST-1021001
---
# ITM-1065 connect refuses a text that is no token of either server, and setup keeps no form of its own

**REGISTER**

## Outcome

MOD-settings-pages (accepted) says of a pasted token: "The form of a token is `connect`'s alone, here as in the import".
`src/settings-pages/setup.mjs:35-36` keeps a form of its own:
`if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(value)) return "That is not a GitHub token — it starts with github_pat_ and is long.";`.
TST-588009 pins it: a pasted "my password" is refused, nothing is stored and nothing is sent.

`connect` (`src/repository-hosts/index.mjs:61-62`) tells a token of the other kind of server, but takes a text that is a
token of neither. So the positive form lives only in `setup`, which the accepted sentence forbids. Removing it there
would lose the refusal TST-588009 guards.

**It begins with a draft for akmaier:** MOD-repository-hosts' `connect` also refuses a text that is a token of neither
kind, with a `TypeError` whose message never holds the text. `setup` then keeps no form of its own.

## Acceptance

- After the accepted draft, `connect` refuses a text of neither kind, and `setup` refuses "my password" through it.
  TST-588009 holds with nothing stored and nothing sent, and `setup.mjs` names no token form.
- A test checks `connect` with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Its draft for akmaier is on `main`** (written by developer-sonnet-d). developer-sonnet-d counted its cost before, by a
planted refusal in `connect` run over the node suite against the base:
- at least 8 tests newly fail, in about 5 files: TST-285 and 287 (`release-sprint-09-uc-001-add-product`,
  `system-uc-001-add-product`), TST-418120 and 418124 (`release-uc-019-change-requirements-by-prompt`), and TST-669002 and
  856001 to 856003 (`site-frame-chosen-product`);
- the release tests among them are changed by a participant who builds none of this item;
- the Python suite does not change.
The length rule of `setup.mjs:36` goes, so `github_pat_x` is accepted. TST-588009's and TST-1021001's expected line becomes
the shared refusal.

