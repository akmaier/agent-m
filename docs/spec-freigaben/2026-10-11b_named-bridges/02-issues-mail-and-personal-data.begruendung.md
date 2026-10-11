# 14. Issues, mail and personal data: a mailbox goes through the bridge its connection names

**The change.** `A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE` and `THE MAILBOX PASSWORD LEAVES
THE BROWSER ONLY TO THE BRIDGE` read "the bridge its connection names" where they read "the local bridge". One new
requirement follows the second: `A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE`. The changed requirements keep
their names; each check now says how its test works and what it checks. The rest of the section is carried over byte for
byte.

**Why.** Asked whether mail over IMAP may go through a bridge other than this computer's, the PO answered, 2026-10-11:
"Any Bridge". Asked what Agent M should do when that bridge is reached through the jump host — whose web server ends TLS,
and where the two SSH tunnels meet on its loopback, so that the password and the mails pass it readable —, the PO answered:
"Warn before saving".

**Design principles.** *Adding one of a kind changes nothing of another*: a mailbox names its bridge as an endpoint and a
participant do, so one more bridge changes no mailbox. *No special first case*: this computer's bridge is one bridge among
several. *Nothing the SPEC already says*: `THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE` covers the
browser's store, not the jump host, so the warning is a requirement of its own, in the form of `A PLACE OUTSIDE THE EU IS
NAMED AS NOT COMPLIANT`.

**Where.** The two requirements and the new one after them. `THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST`
and `THE MAIL SERVER IS REACHED ONLY OVER TLS` hold unchanged for every bridge.

**Impact list.**
- `A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE`: UC-037, UC-038, UC-039; ARC-044, ARC-051,
  ARC-053; MOD-mail-routes, MOD-mail-protocols — whose text holds for whichever bridge it runs on and does not change. Its
  check `tests/test_mail_routes.py` is not yet written.
- `THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE`: UC-037, UC-038, UC-039; ARC-040, ARC-044; MOD-bridge-client,
  MOD-desktop-shell, MOD-mail-routes. Its check `tests/test_mail_password_route.py` is not yet written.
- The new requirement: UC-037, which names it among what it realises; MOD-mail-routes and MOD-settings-pages. Its check is
  a case of `tests/test_settings_disclosure.py`.
