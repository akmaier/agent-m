// How acceptance works — what a click on the dashboard does, in words (SPEC §10; UC-006, UC-008).
//
// Module: MOD-dashboard-app
//
// Route #how. It gets `app`, the page's context (dashboard-app.mjs).

function viewHow(app) {
  const { T, GITLAB, state, main, md } = app;
  const token = app.token;
  main().innerHTML = `<article class="md doc how">${md(`
## How acceptance works

**Acceptance is a commit.** With a token stored in this browser, *Accept* commits a short approval
record under your account. Without one, the page opens GitHub's *new file* page with the record
already filled in, and pressing *Commit changes* there is the act of accepting. Git records who and
when; the record says which text.

**Several at once.** With a token, tick the use cases and SPEC entries you have read and press
*Accept ticked*: one commit, one record per ticked file. A file that changed after it was shown is
left out and named.

**Everything on one page.** *Review all* on the use-case list and on the architecture view opens one
page with every file of that area that is not accepted — a changed one as its difference to the text
accepted before, a new one in full — and *Accept all N shown* below them accepts exactly those, in one
commit. A file that waits for an open requirement or use case is shown, but not counted.

**The record names the text by its SHA.** The page computes the git blob SHA of exactly the text it
shows you, the same number \`git hash-object\` would give. A use case counts as accepted only while
its current text has that SHA. Edit it later, and it shows as *changed* again, with no status to
reset.

**Editing** happens here with a live preview. *Copy & open GitHub editor* puts your text on the
clipboard and opens GitHub's editor for the file: select all, paste, commit. The new text is then
reviewed like any other.

**Architecture.** Decisions (\`docs/architecture/ARC-<nnn>-<slug>.md\`) and modules
(\`docs/architecture/MOD-<slug>.md\`) are accepted like use cases, with a record of the same form. *Accept* is offered only
while every requirement and use case the file names is accepted; for a change to an accepted decision or module, only after
the dashboard has shown which modules, code files and tests it touches.

**SPEC changes.** With a token, the accepting commit itself carries the record, the SPEC section
replaced by the proposal byte for byte, and the decision in the queue's \`entscheidungen.md\` — after
checking, on the commit it writes on, that the proposal and the SPEC section still have the SHAs you
saw. Entries of one queue accepted together are written in the queue's order; an entry whose heading
another entry creates waits for that entry. Without a token, for this instance's own SPEC, a GitHub
Actions workflow makes the same checks after your approval commit and writes the same bytes. If
either text changed in the meantime, nothing is written and the entry shows as *stale*.

**Without write access**, GitHub turns your commit into a pull request. The acceptance counts once
a maintainer merges it.

**Products on GitLab** are read and written through their own server's API, with a project access
token you create for each of them (role Maintainer, scope api) and store in this browser. It is sent
only to that project's API. Without it, a GitLab product is read-only here: GitLab has no page that
could be prefilled with a record, so there is no route without the token. The acceptance is one commit
there too; GitLab refuses it if a file it changes was changed after the dashboard checked it.

Reading: ${GITLAB ? `project \`${T.product.address}\`` : `repository \`${T.repo}\``}, branch \`${T.ref}\`, commit \`${(state.commit || "").slice(0, 12)}\`,
${token() ? "with the token stored in this browser" : "without a token"}. Instance: \`${T.instance}\`.
Products are chosen in the selector at the top. Their list is kept in this browser only, by their
addresses; the instance repository names no product.
`)}</article>`;
}

export const routes = { how: (app) => viewHow(app) };
