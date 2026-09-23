# Why approval moves into git, and what stays the same

**PO instructions, 2026-09-23:**
- *"The github page root lies in docs; the use-cases should go into a subfolder use-cases; products
  will share this folder structure at a later point as well."*
- *"The mechanism to approve and merge the use-cases should be dealt with using git itself; an edit
  of the use-case and the acceptance is set up on the dash-board; the actual act of accepting it is
  executed as a commit using github's web ui."*
- *"I want the same mechanism also for accepting the specification changes for the spec dash-board
  for this product."*

**§9 stays unchanged.** This entry repeats §9 verbatim and adds §10 after it, because the approval
tool replaces a section found by its heading, and §10 does not exist yet. The diff you see is a
pure addition.

**How it works.**
1. The dashboard (on GitHub Pages) shows a use case, or a SPEC proposal with the current SPEC
   section beside it.
2. **Edit:** an editor with a live preview. "Commit in GitHub" copies the text and opens GitHub's
   web editor for that file. You paste and commit, and the file then has a new blob SHA.
3. **Accept:** the dashboard computes the blob SHA of exactly the text it shows and opens GitHub's
   new-file page for `docs/approvals/<id>-<sha>.md`, prefilled with a four-line record. Your commit
   there **is** the acceptance. Git records who and when; the record names what.
4. **Status** is computed, never stored. Accepted means a record names the current SHA. An edit
   after acceptance returns the file to review automatically.
5. **SPEC changes:** a workflow sees the new record, checks that the proposal and the current SPEC
   section still have the SHAs you saw, and writes the proposal into `SPEC.md` byte for byte. It
   also appends the line to `entscheidungen.md`, as the local tool does today. If anything is
   stale, it writes nothing, and the dashboard shows why.

**The measurement behind `NO TEXT TRAVELS IN A URL`.** The first design put the edited text into
the prefilled GitHub link, so that editing and accepting would be a single commit. I tested it
before building on it. Opened in a browser that was not logged into GitHub, a 6 KB prefilled link
went to GitHub's login page with the whole text packed into `return_to`, and GitHub answered with a
500 error. The design therefore separates editing (a commit of the file) from accepting (a commit
of a short record). Whether the `value` prefill works for a logged-in reviewer is not yet measured.
The dashboard always shows the record with a copy button, so acceptance works either way.

**Why a workflow may write to `main` despite §9 `A GENERATED ARTIFACT IS A PROPOSAL`.** That rule
keeps generated content out of the default branch without review. The workflow generates nothing:
it performs a decision a person has just committed, with text that person approved byte for byte.

**Two consequences you should know about.**
- **The process repository's rule changes for this product.** `SOFTWARE_MAINTENANCE.md` names
  `scripts/spec_dashboard.py` as the place where SPEC approval happens. After this entry, Agent M's
  SPEC is approved in GitHub instead. Your instruction covers the product, but the process document
  still says otherwise. That deviation needs a process entry of its own, which is not in this
  queue.
- **This entry must be accepted in the local tool** (`scripts/spec_dashboard.py`), because the
  mechanism it defines does not exist yet. It is the last Agent M SPEC change approved that way.
