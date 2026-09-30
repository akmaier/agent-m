# §7: a hosted job writes with the person's token from a CI secret

**The question (architecture, ARC-010 and ARC-015; measurement 2026-09-30, point 8).** A run should go on
without a click between its jobs (`A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`). GitHub documents that
events caused with the workflow's built-in `GITHUB_TOKEN` start no new workflow run, and that pull requests it
opens start their runs "in an approval-required state" until someone with write access approves them. The
documented remedy: a personal access token or a GitHub App installation token, stored as a secret.

**PO decision, 2026-09-30:** "can't we use github secrets here?" — then option (a): the person's fine-grained
token. Not chosen: (b) a GitHub App, whose tokens expire after an hour and which is not tied to a person, but
which needs an app registration and its private key as secrets.

**What this entry does:**
- **New:** `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`.
- **Changed:** `ONE GITHUB TOKEN SERVES EVERY FEATURE` adds *Pull requests* (open and merge the job's pull
  requests) and *Workflows* (a job that generates the CI configuration, UC-027) to the prefilled permissions.

**A trade-off to know before accepting.** The person's token reaches the instance and every product it was
extended to (`A TOKEN IS SCOPED TO WHAT IT WRITES`). Stored as a secret in product A, it lets product A's
workflows write to product B as well. For a single person running their own products that is the same reach
the dashboard already has; if you want a product's secret to reach only that product, the alternative is a
second fine-grained token per product for CI — say so and I change the entry.

**Still to measure (from the measurement, point 8):** whether a push that changes `.github/workflows/`
needs *Workflows* for a `git push` (documented only for the releases endpoint), and whether pushes with a
GitLab project access token start pipelines.

**Impact list** (files naming `ONE GITHUB TOKEN SERVES EVERY FEATURE` or the new name): `SPEC.md`, UC-014
(step 7, permissions prefilled — updated), UC-010 (precondition — updated); architecture ARC-010, ARC-015,
MOD-participant-ci, MOD-ci-generator follow as an architecture change (UC-023) after acceptance. The rest of
§7 is carried over byte for byte.

**Also added before acceptance (PO decision D (a), 2026-09-30):** `THE JUMP HOST AND THE REMOTE SESSIONS ARE
SETTINGS` gains the jump host's HTTPS address and web-server login — the settings of the route over HTTPS that
queue 2026-09-30h, entry 01, adds to §6. It is here because §7 is this queue's section.
