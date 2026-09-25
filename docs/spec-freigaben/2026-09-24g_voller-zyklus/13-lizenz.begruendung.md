# §0: Agent M's own licence

**PO decision, 2026-09-24:** *"products can have their own license; I want MIT license for agent m;
that should allow virtually any product license."*

The README still says "Licence: not yet chosen … not licensed for reuse" — which, for a tool every
reader is told to fork, is a contradiction. The rule goes to §0 because a licence is part of what the
product is; the section's first sentence therefore changes from "four" to "five". Nothing else in §0
changes.

**Follows after acceptance:** the `LICENSE` file (MIT, copyright holder as the PO names it — proposed:
*Andreas Maier*), the README's licence paragraph, and `tests/test_licence.py`.

**Consistency fix by the main agent, 2026-09-25:** the check of `NO SERVER` listed only the endpoint,
the GitHub API, GitLab servers and the bridge. The pending rules also read package registries (due
diligence, entry 06) and resource hosts such as Hugging Face (entry 10) from the browser — calls the
old check would have failed. The rule is unchanged; only its check names these origins.
