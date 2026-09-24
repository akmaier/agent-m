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

**Corrected after the PO's question of 2026-09-24** — *"Is this really how SCRUM works? Doesn't this
happen in sprint review?"* The earlier draft had the Scrum Master decide every merge
(`A MERGE IS DECIDED BY THE REVIEW ROLE`). The book (ch. 7 §5) gives the Scrum Master no approval
authority — the role "protects and coaches the process", "removes obstacles" — and the Scrum Guide it
cites ties an item's completion to the **Definition of Done**, which the Developers meet; the Sprint
Review inspects the increment at the end of the sprint and adapts the backlog. Also, the accepted
SPEC already says who merges is not restricted (`CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST
WITH GREEN CI`). The draft rule is therefore dropped — it was never in the SPEC, so no withdrawal note is
needed — and replaced by:

- `A PRODUCT DECLARES ITS DEFINITION OF DONE`, `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`,
  `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS` — this also answers open question 2
  above;
- `A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT`, `A SPRINT ENDS WITH A RETROSPECTIVE` — the two Scrum
  events the drafts were missing (new UC-041);
- the branch rules renamed to name phases *and* time boxes, since a sprint is a time box, not a phase in
  the book's vocabulary; the merge of a sprint branch into `main` is decided by the Product Owner after
  the review.

The occasion of `A JOB STOPS AT EVERY GATE` now points to the Definition of Done instead of the dropped
rule, which removes the contradiction noted in the earlier version of this rationale.

The Scrum Master stays a role a person or an agent may hold: it watches the process — overdue reviews,
items stuck in *waiting*, the work-in-progress limit — and has no merge authority.

**Source of the Scrum Guide statements:** the Scrum Guide 2020 (Schwaber and Sutherland), cited by the
book as `Scrum2020`; quoted from the guide by the main agent, not from the book. Check them against the
guide before accepting, if in doubt.
