# 7. Configuration and secrets: a product on GitHub has a token of its own

**The change.**
- `ONE GITHUB TOKEN SERVES EVERY FEATURE` keeps its name and its permissions. Its rule no longer says that a person is asked
  for one token: each token Agent M asks for — the instance's and each product's — is one token that carries every
  permission. Its check adds the link for a product's token.
- New: `A GITHUB PRODUCT USES A TOKEN OF ITS OWN` — for a product on GitHub, a token whose only repository is the product's.
  It stands beside `A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`, which already gives each GitLab product its own token.
- New: `A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT` — the prefilled name and description are built from the product
  repository's name.
- Every other requirement of §7 is carried over byte for byte.

**Why.** PO, 2026-10-06, after testing *+ Add product*: "I get to the prefilled site, but the token is configured for
agent-m … It should however be the token for the product and the description must be constructed from a template that uses
the product repos name. Also the token name should contain the product name, it can indicate that the token is for agent-m
and the GitHub user." And: "There needs to be a difference in setting up the token for the instance compared to the
product."

GitHub's documentation, read 2026-10-06 (docs.github.com, *Managing your personal access tokens*):
- "Each token is limited to access resources owned by a single user or organization." One token for the instance and every
  product cannot reach a product whose owner is another account or an organisation.
- The prefilled page takes `name` (at most 40 characters), `description` (at most 1024) and `target_name`, the owner of the
  repositories the token reaches.

**Impact list** (`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`) — every artifact that names
`ONE GITHUB TOKEN SERVES EVERY FEATURE`, on `main` at `4ab0c7d`:
- use case UC-014 (`realises`) — its text changes with this queue: one key for the instance, products get their own (UC-001);
- architecture: ARC-047 *Access* (forced by it; its text speaks of tokens in general and stays), MOD-repository-hosts (the
  token page — gains the repository's owner as the token's owner);
- code: `docs/assets/dashboard/settings-view.mjs`, `docs/assets/git-host.mjs`, `src/repository-hosts/web-links.mjs` —
  comments naming the requirement;
- tests: `tests/test_token_scope_documented.py`, `tests/test_settings_disclosure.py`, `tests/repository-hosts.test.mjs`,
  `tests/review-core.d/dashboard-app.test.mjs`, `tests/review-core.d/git-host.test.mjs`,
  `tests/system-uc-001-add-a-managed-product.test.mjs`, `tests/release-sprint-01-dashboard-app.test.mjs`,
  `tests/release-sprint-02-d-dashboard-app.test.mjs`, `tests/release-sprint-02-d-settings-store.test.mjs`,
  `tests/release-sprint-04-uc-001-repository-hosts.test.mjs` — they check the permissions, which do not change;
- records and fixtures that name it — dated measurements, the backlog fixtures of sprint 02 — stay as they are.

**Drafted with this queue, open for acceptance:** UC-001 (Step A asks for the product's own token), UC-014 (the instance's key
serves the instance; products get their own), UC-042 (the settings show each product's token), MOD-browser-store (a key per
GitHub product's token), MOD-repository-hosts (the token page names the repository's owner).
