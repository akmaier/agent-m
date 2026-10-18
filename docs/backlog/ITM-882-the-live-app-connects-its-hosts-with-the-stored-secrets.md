---
id: ITM-882
title: The live app connects its hosts with the stored secrets
level: module
realises:
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-site-frame
builds_on:
  - ITM-868
tests:
  - unit
origin:
  - developer-sonnet-a's findings on ITM-868's pull request #844 (sprint team1/87)
---
# ITM-882 The live app connects its hosts with the stored secrets

**REGISTER**

## Outcome

The live app connects hosts of its own with `{ token }` only, without `secrets`:
- `src/site-frame/dashboard-app.mjs:214`;
- `:536` (`instanceHostFollowingToken`);
- `:654`;
- `:766-768`.
A host connected without `secrets` does not refuse a commit that holds a stored secret (MOD-repository-hosts.md:199). The
frame's own connection passes them (`src/site-frame/routing.mjs:66`, `secrets: secretValues(store)`), and MOD-site-frame's
Uses name `MOD-browser-store.secretValues` (MOD-site-frame.md:14).

developer-sonnet-a saw it in the harness: before any reconnect, a commit holding a stored secret is not refused through
the host the app connected. The other calls are leads from the code, measured at the start. `:437-438`
(`showTokenNotices`) connects without a token and only reads; whether it needs `secrets` is read there too.

## Acceptance

- Each host the live app connects passes `secrets: secretValues(store)`, as the frame's does, and a commit that holds a
  stored secret is refused through each one with `SecretRefused`. The tests pin each path, with counter-proofs (sprint
  81's agreement).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
