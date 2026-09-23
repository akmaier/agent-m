# SPEC approvals — queue 2026-09-24 · one click per decision

**PO, 2026-09-24:** *"Users will need support here. They might be new to GitHub. Also there should
be explanations that can be expanded on the UI … Step 7 and 9 … both need to be automated … Too much
clicking kills our user experience."* — and the decision the same day: with a stored token, *Accept*
and *Save* commit directly from the dashboard; without one, GitHub's web interface remains the
fallback.

**Measured 2026-09-24** (logged-in Chrome, form read, no token created): the link
`github.com/settings/personal-access-tokens/new?name=…&description=…&expires_in=90&contents=write&pull_requests=write&metadata=read`
arrives with name, description, expiry date (+90 days) and all three permissions set. **Repository
access is preset to *All repositories*.** Two guessed parameters (`install_target=selected`,
`repositories=…`) changed nothing, and GitHub's documentation lists only `name`, `description`,
`target_name`, `expires_in` and permission names — there is no parameter for the repository choice.

**Impact analysis:**

| Name | Change | Referenced by |
|---|---|---|
| `ACCEPTANCE IS A COMMIT IN GITHUB` | reworded: a commit under the person's own account, from the dashboard or GitHub's UI | UC-006, UC-008, `tests/test_approval_records.py` (still correct) |
| `EDITS ARE PREPARED ON THE DASHBOARD` | reworded: saving commits directly | UC-008 (follows) |
| `THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ` | **withdrawn**, replaced by `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK` | UC-008, `tests/review-core.test.mjs` (follow) |
| `A TOKEN IS SCOPED TO WHAT IT WRITES` | unchanged; two new rules make it achievable | UC-001, `tests/test_token_scope_documented.py` |

The use cases are rewritten to match and are on `main` as *open* (§9 `A REVIEWED ARTIFACT ENTERS THE
DEFAULT BRANCH AS OPEN`); review them after this queue.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
| 02 | `SPEC.md` | ## 9. Human gates | — | — |
| 03 | `SPEC.md` | ## 10. Review on GitHub Pages | — | — |
