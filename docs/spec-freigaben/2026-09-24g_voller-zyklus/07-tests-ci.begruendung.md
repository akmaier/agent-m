# §12: tests and continuous integration

**Drafted by a subagent** from the PO's words of 2026-09-24 (quoted in the draft) and the book; read in
full, cross-checked against the other groups and integrated by the main agent. The rules are in the
five-field form, one statement each, with a named check. Where the section already existed, only the
listed rules change — the diff on the dashboard shows exactly that.

**Aligned with UC-013:** a release starts the complete run on a release candidate; whether a red level
blocks the tag or may be accepted with known limitations (the book's conditional acceptance, ch. 13 §7)
is open question 1 below — UC-013 and UC-028/UC-030 are written for the second, and change with one
word if you choose the first.

## Open questions of the drafting group

1. **Red release run.** `A RELEASE RUNS EVERY TEST AT EVERY LEVEL` requires the run, not a green
   run. Does a failed or worse-rated test block the tag, or can the person accept the release with
   known limitations (the book's "conditional acceptance", ch. 13 §7), recorded in the approval?
   Draft UC-028/UC-030 assume the latter; a one-word change makes it the former.
2. **Where result records live.** Per-commit results could stay on the CI server (GitHub keeps run
   logs and artifacts only for a retention period), or be committed — to the default branch, to a
   dedicated results branch, or only for release runs. The drafts assume: release reports are
   committed under `docs/tests/releases/`; other records are read from the CI server as long as it
   keeps them. Is that acceptable for audit, or must every record be committed?
3. **Browser access to CI results — feasibility not verified.** Whether the dashboard can download
   a GitHub Actions artifact (a zip behind a redirect) cross-origin is unmeasured; GitLab offers a
   per-pipeline test-report endpoint, reachable only if the product's server allows the Pages
   origin. Per `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`, this needs a measurement before
   UC-028 is built; the fallback is a record committed by the workflow itself.
4. **Token scope.** Starting a run from the dashboard (UC-028) needs permission to dispatch
   workflows (`actions: write` on GitHub; on GitLab the `api` scope already covers pipelines). Extend
   the prefilled token (`THE TOKEN LINK IS PREFILLED`), or open GitHub's Actions page instead?
5. **CI secrets.** Agent M could set Actions secrets through the API (encrypted in the browser),
   which widens the token again; the drafts instead name each secret and link the server's own
   secrets page. Confirm.
6. **Independence on a one-person product.** `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
   blocks an author who has only one agent. Is a different participant (another model endpoint)
   enough, must it be a person, or should the rule be reported rather than enforced (like
   `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN`)?
7. **User-level tests.** Alpha, beta and acceptance tests are carried out by people. The drafts treat
   them as manual test cases whose outcome a person enters on the dashboard, recorded like any other
   result. Is that the intended scope, or are user tests outside Agent M?
8. **Local results as evidence.** A run through the local bridge on the author's machine produces a
   record too. Should it count in the audit view, or only runs in CI and sandboxed agents on a clean
   checkout of the commit? Drafts: shown everywhere, counted in the audit only when the working tree
   was clean.
9. **UC-013 needs a step.** Releasing must start the complete run and wait for it before tagging;
   UC-013 (outside this group) would need that step. UC-028 describes it as alternative flows 1a
   and 1b.
10. **Schedule by pull request.** UC-027 puts the schedule file into the same pull request as the
    generated CI configuration, so that the two never disagree on the default branch. That departs
    from `A PERSON'S OWN INPUT IS COMMITTED DIRECTLY`. Accept the exception, or commit the schedule
    directly and let the dashboard show "configuration pending" until the pull request is merged?

**Decided by the PO on 2026-09-24** — see the table on the queue's index page; the questions below that it answers are settled, the others stay open.

**Comfort review by the main agent, 2026-09-25:** a release took three clicks — start the candidate,
accept the report, release. `ACCEPTING THE RELEASE TEST REPORT RELEASES` makes it two; UC-013 and UC-028
changed accordingly.
