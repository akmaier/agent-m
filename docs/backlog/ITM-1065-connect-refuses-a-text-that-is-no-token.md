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
