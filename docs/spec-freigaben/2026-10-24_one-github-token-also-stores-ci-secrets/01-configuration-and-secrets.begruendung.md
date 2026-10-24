# 7. Configuration and secrets: one GitHub token also stores CI secrets

**The change.** In `ONE GITHUB TOKEN SERVES EVERY FEATURE`, the permissions the token carries name *Secrets* read and
write beside *Actions* and *Workflows*; the rest of the section is as it stands.

**Why.** akmaier, 2026-10-24, after the one-click that stores an endpoint's key as a GitHub Actions secret was refused
for want of *Secrets* and then the endpoint's test job for want of *Actions*: "Note that all these additional
permissions must also be configured at the time of the agent-m token generation." *Actions* read and write is already
named; *Secrets* is not, so the token page Agent M opens does not ask for it, and the person adds it by hand afterwards.
GitHub names the permission `secrets` (read, write) among the repository permissions a token page can be prefilled with
(docs.github.com, "Managing your personal access tokens", pre-filling fine-grained token details, read 2026-10-24).

**Impact list.**
- ONE GITHUB TOKEN SERVES EVERY FEATURE: changed; its checks `tests/test_token_scope_documented.py` and
  `tests/dashboard-review-flows.test.mjs` read the permissions of the prefilled link; MOD-repository-hosts' webLinks
  (`GITHUB_PERMISSIONS` in `src/repository-hosts/web-links.mjs`) builds it; MOD-settings-pages' route `setup` names the
  permissions beside it.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
