# SPEC approvals — queue 2026-09-23d · instance, products and token

**Three PO statements of 2026-09-23 made precise:**
- *"The dashboard should remain in agent-m but the docs must be in the product."* §10 said the
  opposite ("the GitHub Pages site of Agent M **and of every product it manages**"), and UC-001
  followed it.
- *"It must be in the local store."* §7 named endpoint, model and API key; the GitHub token was
  missing.
- *"Users of agent m fork the entire repo."* An instance is a fork. Private product repositories
  may be read by the dashboard with the stored token, `GET` only (PO answer, same day).

**This is the first SPEC change approved through the git route of §10.** Accept on the dashboard;
the workflow `apply approvals` then writes the entry into `SPEC.md`.

**Impact analysis** (names this queue changes or withdraws, and who references them):

| Name | Change | Referenced by |
|---|---|---|
| `CONFIGURATION LIVES IN THE BROWSER` | GitHub token added to the rule | `UC-003` (still correct) |
| `THE PAGES ROOT IS DOCS` | products removed from the rule | `UC-001` (**must change**: step 7 enables Pages for the product), `tests/test_pages_layout.py` (docstring only) |
| `THE REVIEW DASHBOARD HOLDS NO CREDENTIAL` | **withdrawn**, replaced by `THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ` | `UC-008` realises it, `tests/review-core.test.mjs` names it — both follow in the implementation |

The use-case changes (UC-001 rewritten, UC-008 updated, new UC-014 *Set up an instance*) are prepared
as a pull request and are merged only after this queue is accepted.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
| 02 | `SPEC.md` | ## 10. Review on GitHub Pages | — | — |
