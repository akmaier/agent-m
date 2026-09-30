# §0: the check of NO SERVER names every origin the design now calls

**Finding (architecture update, PR #19).** The check of `NO SERVER` lists the origins the built site may call:
configured endpoints, repository servers, the local bridge, package registries and resource hosts. Two routes
accepted today were missing from it: the jump host's HTTPS address (`A BRIDGE CAN BE REACHED OVER HTTPS
THROUGH THE JUMP HOST`) and the mail provider's API and sign-in (Microsoft Graph and Microsoft's sign-in,
`A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE`). The second was found by the main
agent while writing this entry.

**PO decision, 2026-09-30:** "4 OK".

**The change:** only the check; the rule and its occasion are unchanged. Both origins belong to the person
(their jump host) or to a provider they signed in to — neither is a server of the project, which is what the
rule forbids. The rest of §0 is carried over byte for byte.

**Impact list:** `SPEC.md`; `tests/test_no_backend.py` (not yet written) follows with the implementation.
