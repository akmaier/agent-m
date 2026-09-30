# §7: GitLab project token with role Maintainer

**PO decision, 2026-09-30:** *"Point 1 (a) the SPEC prescribes role Maintainer."*

**Found while building GitLab support (PR #12):** GitLab's default branch protection is "Fully protected —
Developers cannot push new commits" (GitLab documentation, `doc/user/project/repository/branches/default.md`).
A project access token with role *Developer*, as the rule prescribed, is therefore refused on every write
to the default branch of a project with default settings. Of the two remedies — a Maintainer token, or
telling people to let Developers push to the default branch — the PO chose the first.

**Changed under its existing name:** only the role, and one sentence of the occasion. Nothing else in §7
changes.

**What the person should know:** a Maintainer token can do more in its one project than write files — for
example change the project's settings. It still reaches only that project (`A TOKEN IS SCOPED TO WHAT IT
WRITES`), and only a person who is Maintainer of the project can create it (UC-001, 3d).

**Impact list:** UC-001 alternative flow 3c (names the role); the dashboard's guidance and messages in
`docs/assets/review-core.mjs` and `docs/assets/review-app.mjs` (role Developer, the 403 explanation, the
role check on the settings page); `tests/review-core.test.mjs` (the guidance test names Developer). The
code follows after acceptance, by pull request.
