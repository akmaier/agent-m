---
id: ITM-993
title: An expired Microsoft sign-in is renewed on the stored connection, and nothing else changes
level: module
realises:
  - UC-037
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - ONE CLICK PER DECISION
modules:
  - MOD-settings-pages
builds_on:
  - ITM-992
  - ITM-428
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-037-2, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-993 An expired Microsoft sign-in is renewed on the stored connection, and nothing else changes

**REGISTER**

## Outcome
- UC-037.md:166-167, 3b: "The sign-in expires. At the next use, the dashboard asks for the provider's sign-in again, in
  the provider's window; nothing else changes."
- MOD-mail-routes.md:124-125: `Mailbox` operations fail with "`SignInExpired` (sign in again; Microsoft's refresh tokens
  for a single-page application expire after a day, ARC-053)".
- MOD-settings-pages.md:192-193 (accepted :191-192): the route `mailbox` holds "for Microsoft 365 the app registration's
  steps and the sign-in with its permissions named before the provider's window opens".

Today *Test* on a connected Microsoft 365 mailbox that finds `SignInExpired` only says "sign in with Microsoft again"
(`src/settings-pages/mailbox.mjs:90-92`) and offers no sign-in. The route `mailbox` opens empty: its `render` reads no
stored connection (`:218`). So the person has to enter the address, client ID, folders and places anew, and *Store and
test* writes a new connection over the old one.

The item does two things:
- Opened from the connected line (ITM-992's *Change*), the route `mailbox` shows the stored connection's fields.
- After `SignInExpired`, *Test* offers *Sign in with Microsoft*. It calls `signIn` with the stored client ID and address,
  and keeps the stored address, folders and places byte for byte.

## Acceptance
- Unit tests that name MOD-settings-pages, with a fake `signIn` and a Graph route that answers `SignInExpired` once:
  - the line offers *Sign in with Microsoft*;
  - one click signs in with the stored client ID;
  - the stored `mailbox` entry is unchanged apart from the account;
  - the next *Test* is recorded as working.
- Counter-proof: a renewal that writes a fresh connection, for example with `folders` reset to `INBOX`, fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.

**Independence of team 1.** As ITM-992, it touches MOD-settings-pages and waits for the same release and acceptance.

**Read again at registration (po-opus-b).** MOD-settings-pages' current blob is *changed* by team 1's draft (`dcf9e549`); the
quoted lines stand in it and in the accepted blob `447a1a58`. The item starts once team 1's sprint 92 leaves
MOD-settings-pages and the draft is decided.

