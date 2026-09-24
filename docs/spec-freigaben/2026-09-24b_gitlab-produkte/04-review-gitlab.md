## 10. Review on GitHub Pages

**THE PAGES ROOT IS DOCS** *(PO A. Maier, 2026-09-23, products removed 2026-09-23)*
The GitHub Pages site of an Agent M instance is served from the `docs/` folder of its default
branch.
*Occasion:* one known place for everything a reviewer reads. Code, tooling and the SPEC's approval
machinery stay outside the published tree.
*Check:* `tests/test_pages_layout.py`

**ONE REVIEW LAYOUT FOR EVERY PRODUCT** *(PO A. Maier, 2026-09-23)*
Agent M and every managed product use the same layout below `docs/`: use cases in
`docs/use-cases/`, SPEC change queues in `docs/spec-freigaben/`, approval records in
`docs/approvals/`.
*Occasion:* products will adopt this structure later. One layout means one dashboard serves all of
them, and a reviewer who knows one product knows where to look in the next.
*Check:* `tests/test_pages_layout.py`

**ONE USE CASE, ONE FILE** *(PO A. Maier, 2026-09-23)*
Each use case is a single Markdown file named `docs/use-cases/UC-<nnn>-<slug>.md`.
*Occasion:* a file is the unit git versions, diffs and hashes. One use case per file makes each
one separately editable and separately acceptable.
*Check:* `tests/test_usecase_fields.py`

**ACCEPTANCE IS A COMMIT IN GITHUB** *(PO A. Maier, 2026-09-23, reworded 2026-09-24 — withdrawn 2026-09-24)*
*Withdrawn:* the accepting commit of a GitLab product is made on its GitLab server. Replaced by
`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`. The name is not reused.

**ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON** *(PO A. Maier, 2026-09-24)*
A use case or a SPEC change is accepted by a commit, made under the accepting person's own account on
the server that hosts the repository, that adds an approval record to `docs/approvals/`.
*Occasion:* git already records who decided, when, and on which text — on GitHub and on GitLab
alike.
*Check:* `tests/test_approval_records.py`

**AN APPROVAL NAMES THE EXACT TEXT** *(PO A. Maier, 2026-09-23)*
An approval record names the file it approves and the git blob SHA of the text the reviewer saw.
*Occasion:* "accepted" is meaningful only together with which text. A blob SHA identifies that
text exactly and can be recomputed by anyone from the file.
*Check:* `tests/test_approval_records.py`

**STATUS IS DERIVED FROM THE RECORDS** *(PO A. Maier, 2026-09-23)*
A reviewed file counts as accepted exactly when an approval record names its current blob SHA.
*Occasion:* a stored status drifts from the text it describes. Derived, an edit after acceptance
returns the file to review by itself, and nobody has to remember to reset anything.
*Check:* `tests/review-core.test.mjs`

**THE REVIEW DASHBOARD HOLDS NO CREDENTIAL** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-23)*
*Withdrawn:* private product repositories cannot be read without a token. Replaced by
`THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ`. The name is not reused.

**THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* accepting and editing are now one click on the dashboard, which writes with the
person's token. Replaced by `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`. The name is not reused.

**THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK** *(PO A. Maier, 2026-09-24)*
The dashboard writes to a repository only as the direct result of a person's action on it, as a
commit made with that person's own token.
*Occasion:* every write stays attributable to a person and a decision; nothing is written in the
background, on load, or on someone else's behalf.
*Check:* `tests/review-core.test.mjs`

**WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK** *(PO A. Maier, 2026-09-24)*
Without a stored token, accepting and editing open GitHub's web interface with the commit prepared
as far as GitHub allows.
*Occasion:* a reviewer who does not want to store a token can still decide; it costs more clicks,
not the ability.
*Check:* `tests/review-core.test.mjs`

**EDITS ARE PREPARED ON THE DASHBOARD** *(PO A. Maier, 2026-09-23, reworded 2026-09-24)*
The dashboard offers an editor with a live preview for a reviewed file, and saving commits the
edited text under the person's own account.
*Occasion:* reviewing and correcting belong on one screen. Copying text into GitHub's editor was
five actions for one decision.
*Check:* `tests/review-core.test.mjs`

**NO TEXT TRAVELS IN A URL** *(PO A. Maier, 2026-09-23)*
A link that prepares a commit in GitHub carries at most a file path and an approval record, never
the reviewed text.
*Occasion:* measured 2026-09-23: a link prefilled with 6 KB of text sent a logged-out reviewer
through GitHub's login redirect, which answered HTTP 500.
*Check:* `tests/review-core.test.mjs`

**AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* the workflow exists only in the instance repository, so an accepted SPEC change of a
product was never written. Replaced by `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL`. The
name is not reused.

**AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL** *(PO A. Maier, 2026-09-24)*
With a stored token, accepting a SPEC change commits the approval record and the replaced SPEC
section together, in one commit, with the approved proposal text byte for byte.
*Occasion:* one commit, one decision: the SPEC can never show an approval without its change or a
change without its approval. It works the same on every server, and no product needs a workflow.
*Check:* `tests/review-core.test.mjs`

**WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE** *(PO A. Maier, 2026-09-24)*
When an approval record for the instance's own SPEC is committed without the dashboard, the
instance's workflow writes the approved section byte for byte.
*Occasion:* the no-token route through GitHub's web interface stays usable for the instance's own
SPEC, which is the only repository that carries the workflow.
*Check:* `tests/test_apply_approvals.py`

**A STALE APPROVAL IS NOT APPLIED** *(PO A. Maier, 2026-09-23, reworded 2026-09-24)*
Nothing is written when the proposal or the current SPEC section differs from the blob SHAs named in
the approval record.
*Occasion:* the reviewer decided on one proposal beside one current text. If either changed after
the decision, the decision does not cover the new state. This holds for the dashboard and for the
workflow alike.
*Check:* `tests/test_apply_approvals.py` · `tests/review-core.test.mjs`

**AN INSTANCE IS A FORK OF AGENT M** *(PO A. Maier, 2026-09-23)*
A person or team runs Agent M as their own fork, and the fork's Pages site is the dashboard for the
products that instance manages.
*Occasion:* every user then has their own dashboard, their own settings, and their own browser
storage origin; nothing is shared with the author's instance or with other readers.
*Check:* `tests/test_instance_target.py` — the dashboard derives its own repository from the Pages
address it is served from.

**A MANAGED PRODUCT NEEDS NO PAGES SITE** *(PO A. Maier, 2026-09-23)*
A managed product keeps its artifacts below `docs/` in its own repository and is reviewed through
the instance's dashboard, never through a site of its own.
*Occasion:* one dashboard per instance, one place to keep up to date. The artifacts stay with the
product's code; the tool stays with the tool.
*Check:* no automatic check; at review.

**THE INSTANCE LISTS ITS PRODUCTS IN A FILE** *(PO A. Maier, 2026-09-23)*
An instance names the product repositories it manages in `docs/products.md` of its own repository.
*Occasion:* the list is then the same in every browser, changes by commit like everything else, and
a reviewer sees which products an instance manages without any settings.
*Check:* `tests/test_products_register.py`

**ONE CLICK PER DECISION** *(PO A. Maier, 2026-09-24)*
A decision a person makes on the dashboard — accept, save, add a product, release — takes one click
once its inputs are complete, and everything that follows from it is done by Agent M.
*Occasion:* PO, 2026-09-24: "Too much clicking kills our user experience." Each extra step between
a decision and its effect is a place to get lost.
*Check:* no automatic check; at review of each use case.

**EVERY STEP EXPLAINS ITSELF** *(PO A. Maier, 2026-09-24)*
Every step that asks something of the person carries an explanation that can be expanded, written
for someone new to GitHub.
*Occasion:* PO, 2026-09-24: users "might be new to GitHub". The explanation stays folded for
those who do not need it.
*Check:* `tests/test_step_explanations.py`

**A PRODUCT IS NAMED BY ITS ADDRESS** *(PO A. Maier, 2026-09-24)*
A product is identified by the web address of its repository, on `github.com` or on a GitLab server.
*Occasion:* `owner/name` is ambiguous as soon as there is more than one server, and GitLab projects
sit in nested groups (`group/subgroup/project`). The address is what a person copies from the
browser anyway.
*Check:* `tests/review-core.test.mjs`

**GITLAB PRODUCTS ARE SUPPORTED** *(PO A. Maier, 2026-09-24)*
Agent M reads and writes products on any GitLab server whose API accepts requests from the instance's
Pages address.
*Occasion:* products at the author's institution often live on a self-hosted GitLab. Measured
2026-09-24: `gitlab.com`, `gitlab.rrze.fau.de` and `gitos.rrze.fau.de` answer a cross-origin
preflight from `https://akmaier.github.io` with `Access-Control-Allow-Origin: *`, allow the headers
`authorization` and `private-token`, and allow `POST`/`PUT`.
*Check:* `tests/review-core.test.mjs`

**A GITLAB PRODUCT IS WRITTEN WITH A TOKEN** *(PO A. Maier, 2026-09-24)*
Accepting and editing in a GitLab product require a stored token; there is no web-interface fallback.
*Occasion:* GitLab's new-file page reportedly ignores prefilled content (GitLab work item 594214 —
reported, not measured here), so the route that works without a token on GitHub does not exist
there. The dashboard says so instead of offering a route that fails.
*Check:* `tests/review-core.test.mjs`
