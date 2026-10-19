---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 4455c6da1014938c0283003a4a5600f29112cc35
  - https://github.com/akmaier/agent-m/pull/1173
date: 2026-10-19 22:23 UTC
---
# Development → Release testing: ITM-1127, the settings page's subject names each setting and whether it is stored

**REGISTER**

## Reason

ITM-1127, pull request #1173 into `sprint/team2/97`, is rejected on `4455c6da`. CI is green, and the red commit `377b6be8`
failed. This is its first rejection.

**The mailbox's line is written to fit a test's words, not to say what is stored.**
- `src/settings-pages/subject.mjs` names the mailbox "Mailbox (its password or sign-in)", whatever the stored entry is.
- UC-049 3c asks that "the context names the settings and whether each is stored". A Graph mailbox stores a sign-in and
  no password.
- g's reading 2 says so: the line names a password because TST-513023 asks for `/(password)[^\n]*\bstored\b/`.
- TST-513023's world is `tests/uc-039-world.mjs`'s `openReplies`, whose default route is `graph` (:301, :318). There,
  `writeSetting(..., "mailbox", { route: "graph", graph: { clientId, account } })` stores no password.
- So the test's given ("a browser that stores … a mailbox password") is false for its own world, and its expectation does
  not follow UC-049 3c.

**What changes, on this branch:**
1. The mailbox's line says what its stored entry is — the IMAP password, or the Microsoft sign-in — by its `route`.
   A test pins both routes. g writes it.
2. TST-513023's expectation follows its world and UC-049 3c. The mailbox, by the name the line gives it, is said to be
   stored. developer-sonnet-h changes it, because a release test is not changed by the implementer of what it tests
   (agreements 92 and 95). h also removes its `todo` mark, in a commit of its own.

**Accepted as they stand:**
- an endpoint without a key is stored, but its key is "not set";
- the browser's own records are not named, since they are no settings a person sets;
- "works or has expired" is not asked by ITM-1127.
