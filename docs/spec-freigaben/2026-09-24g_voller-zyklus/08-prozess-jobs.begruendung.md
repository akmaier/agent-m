# §13: process execution and jobs

**Drafted by a subagent** from the PO's words of 2026-09-24 (quoted in the draft) and the book; read in
full, cross-checked against the other groups and integrated by the main agent. The rules are in the
five-field form, one statement each, with a named check. Where the section already existed, only the
listed rules change — the diff on the dashboard shows exactly that.

**Dropped in integration:** `AN IMPLEMENTATION JOB COMMITS FAILING TESTS FIRST` — the same rule as
`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` in entry 06, which is kept because it cites the book
(ch. 13 §5) and its check is sharper (the first commit holds only tests, CI on it is red).

## Open questions of the drafting group

1. **Identifier of a backlog item.** `EVERY ARTIFACT HAS AN IDENTIFIER` allows only `SRC-` `REQ-`
   `UC-` `ARC-` `MOD-` `TST-`. A backlog item is an artifact, so it needs a prefix, for example
   `ITM-`. The use cases below write `ITM-<nnn>` as a placeholder. Adding a prefix changes an
   existing requirement. Impact list (grep of the repository, 2026-09-24): `SPEC.md` §1,
   `docs/use-cases/UC-004-register-a-requirement-source.md`, and
   `docs/spec-freigaben/2026-09-23_agent-m-v1/02-identitaet-und-rueckverfolgbarkeit.md`. Should a
   job also get an identifier, or is it named by its runtime's run ID?
2. **Definition of done for a backlog item.** Proposed for the use cases: an item is done when a
   pull request that names it is merged and every gate its workflow places after implementation is
   recorded. Should this be a requirement of its own?
3. **Where a job's history lives.** `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` reads job state
   from the runtime: GitHub Actions and GitLab pipeline APIs, the local bridge, or the open browser
   tab. Consequences:
   - A job that ran in another browser, or on a bridge that cannot be reached now, is not visible.
   - The bridge keeps its job list only while it runs.

   The alternative is a job record committed to the product repository when a job starts and ends.
   That record would be a write not caused by a click (`THE DASHBOARD WRITES ONLY ON A PERSON'S
   CLICK`), unless the job itself writes it.
4. **How a paused job resumes.** For CI jobs, GitHub's environment protection with required
   reviewers can pause a workflow at a gate. GitLab has manual and protected-environment jobs. For
   a CLI agent, the bridge would hold the job. Is "the same job resumes" required, or may the gate
   end the job so that the person's decision starts a follow-on job? The requirement above allows
   both.
5. **Changing a model that products use.** Proposed in UC-031 (alternative flow 6a): a product keeps
   the model version it declared until its author saves the declaration again (UC-002). Confirm, or
   should an adapted model apply to all products at once?
6. **Merging without a person.** `CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN
   CI` lets an agent merge its own pull request. Should the shipped Scrum and Kanban definitions
   carry a review gate before merge by default (book ch. 7 §4: the board's *Review* column), or only
   when a process requirement adds one?
7. **Front-matter value for UC-035 and UC-036.** The `stage` key allows only the listed values. I
   used `5 implementation` for the backlog, implementation and progress use cases, and
   `7 operation` for the job dashboard. A value such as `process` may fit better once the key is
   renamed.
8. **Overlap with other groups.** g3 proposes `EVERY TEST RUN LEAVES A RESULT RECORD`, and g6
   proposes `A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE`. A test-battery run is a job in
   UC-036, and a job's runtime choice is also constrained by g6. The wording should be aligned when
   the three drafts are merged.

**Decided by the PO on 2026-09-24** — see the table on the queue's index page; the questions below that it answers are settled, the others stay open.

**Consistency note (main agent, 2026-09-24).** `A JOB STOPS AT EVERY GATE` lets only a *person's*
decision pass a gate, while the PO decided that the review role deciding a merge may be an agent. The
occasion of `A JOB STOPS AT EVERY GATE` therefore says that the merge is *not* one of those gates; the
gates from the model and from process requirements stay with a person. If the merge should count as
a gate with an agent allowed to pass it, the rule text of `A JOB STOPS AT EVERY GATE` has to change
instead — please say so in the edit field.
