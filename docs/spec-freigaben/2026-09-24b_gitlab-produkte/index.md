# SPEC approvals — queue 2026-09-24b · products on GitLab

**PO, 2026-09-24:** *"Shouldn't this be either github or gitlab URLs? Technically it should also be
possible to run agent M on a private gitlab; it also has token access."* — and the decisions the
same day: products on GitHub **or** GitLab (the instance stays a GitHub fork); a **project access
token** per GitLab product; accepting a SPEC change writes the **approval record and the SPEC section
in one commit**.

**Measured 2026-09-24** (preflight `OPTIONS /api/v4/projects` with `Origin: https://akmaier.github.io`,
requesting `authorization,private-token`; no token sent):

| Server | `Allow-Origin` | `Allow-Headers` | `Allow-Methods` | unauthenticated `GET /api/v4/version` |
|---|---|---|---|---|
| gitlab.com | `*` | `authorization,private-token` | GET … POST, PUT, PATCH, DELETE | 401 (server answered) |
| gitlab.rrze.fau.de | `*` | same | same | 401 |
| gitos.rrze.fau.de | `*` | same | same | 401 |

Measured from a machine that can reach the FAU servers; whether a browser elsewhere can, is a
network question, not a CORS one.

**A defect found on the way — for GitHub products too.** Accepting a SPEC change of a *product*
committed only the approval record. The workflow that writes the SPEC exists only in the instance
repository; *Add product* does not install it. Product SPEC changes would have stayed *approved*
forever. Entry 04 fixes it: record and SPEC section in one commit.

**Impact analysis** (withdrawn or reworded names, and who references them):

| Name | Change | Referenced by — follows in the implementation |
|---|---|---|
| `THE TOKEN IS SENT ONLY TO GITHUB` | **withdrawn** → `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` | UC-001, `docs/assets/review-app.mjs` (comment), `tests/review-core.test.mjs`, `tests/test_destination_disclosure.py` |
| `ACCEPTANCE IS A COMMIT IN GITHUB` | **withdrawn** → `ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON` | UC-006, UC-008, `tests/test_approval_records.py` |
| `AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW` | **withdrawn** → `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL` + `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` | UC-006, `.github/workflows/apply-approvals.yml`, `tools/apply_approvals.py`, `tests/test_apply_approvals.py` |
| `A STALE APPROVAL IS NOT APPLIED` | reworded: holds for dashboard and workflow | same files, still correct |
| `CONFIGURATION LIVES IN THE BROWSER`, `A TOKEN IS SCOPED TO WHAT IT WRITES`, `EVOLUTION ENTERS THROUGH THE SPECIFICATION` | reworded: not GitHub-only | UC-001, UC-003, UC-012 — still correct |
| `NO SERVER` | check text lists the GitLab servers of listed products | `tests/test_pages_layout.py` follows |

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 0. Hard product rules | — | — |
| 02 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
| 03 | `SPEC.md` | ## 9. Human gates | — | — |
| 04 | `SPEC.md` | ## 10. Review on GitHub Pages | — | — |
