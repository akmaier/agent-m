---
id: ITM-1090
title: An item identifier takes three or more digits in the scheme and in identity.mjs
level: module
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-identifiers
builds_on:
  - ITM-1000
tests:
  - unit
origin:
  - akmaier's bug report of 2026-10-19 ("The backlog and the progress bar on the front page only report backlog items until 999. This needs a fix"), on main at 30e4f94b
---
# ITM-1090 An item identifier takes three or more digits in the scheme and in identity.mjs

**REGISTER**

## Outcome

MOD-identifiers.md:54 gives an item's identifier as `ITM-<nnn>`, three or more digits. ITM-1000 changed MOD-work-plans'
reader; its Acceptance left "the other readers of the three-digit form" to later items, one per module. This is the one of
MOD-identifiers.

MOD-identifiers.md:54 states `ITM-<nnn>`, three or more digits. `src/identifiers/scheme.mjs:24` has `["ITM", /^ITM-\d{3}$/]`, with a comment that says exactly three. `docs/assets/artifacts/identity.mjs:31` and `:50`, taken over by MOD-identifiers (MOD-identifiers.md:39), read `ITM-\d{3}` too.

## Acceptance

- Unit tests naming MOD-identifiers: ITM-100, ITM-999 and ITM-1000 are item identifiers, and a backlog file `ITM-1000-x.md` is recognised; `ITM-99` is not. Where `identity.mjs` lists items, the order is by number.
- Wherever this reader orders items, it orders them by number, as ITM-1000 does, not as text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/identifiers/scheme.mjs`, `docs/assets/artifacts/identity.mjs` and the tests that name MOD-identifiers change.
