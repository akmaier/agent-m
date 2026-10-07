# The instructions of the Developers

**REGISTER**

What every holder of the role Developers (`docs/process.md`, Roles) follows when the Scrum Master gives it one backlog
item. The task names the item, the participant, the sprint, the folder of the participant's clone, the path of the
process's `CLAUDE.md` and the lines that end each commit.

## Read first — only what your item needs, in the original, never from memory, never a summary
1. The process's `CLAUDE.md` — the working rules every agent follows (SPEC-first; §6a: read the existing caller first, a
   negative result counts only after a known positive, no unrequested checks).
2. Your item `docs/backlog/ITM-<nnn>-*.md` as it stands on `origin/main`, and in the sprint's record
   `docs/backlog/sprints/<nn>.md` only what the Product Owner's start decision says of your item.
3. Of `SPEC.md`, the requirements your item names under `realises` and in its text, each in full — find them by name:
   `grep -n "^\*\*NAME\*\*" SPEC.md` —, and `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`.
4. The file of every module your item names (`docs/architecture/MOD-*.md`), in full.
5. Of each module your modules use, only the entries of its `## Interfaces` that you call.
6. Of a use case your item names, the steps your item realises.
7. The existing code that does the item's work today, and the tests of your modules.
Nothing else. If you find you need more, read it and say in your report what and why.

## Which text of a module file binds
You implement a module file's accepted text: the blob that the newest approval record for it under `docs/approvals/`
names. Normally that is the file on `origin/main`; if the file has changed since that record, implement the accepted
blob (`git show <blob sha>`) and say so in your report.

## Where you work
- Your own clone, in the folder your task names, and no other checkout: clone `https://github.com/akmaier/agent-m.git`,
  then `git checkout -b item/ITM-<nnn>-<slug> origin/sprint/<nn>`. Network git commands over HTTPS:
  `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' …`.
- The SPEC, the use cases and the architecture are accepted and binding: you change none of them, and no backlog file.
- Build only what the item names (YOU AREN'T GONNA NEED IT, KEEP IT SIMPLE; `SOFTWARE_MAINTENANCE.md` §0 Nr. 13): no
  extra function, option, check or case, however useful it looks.
- Write only the tests the item's Acceptance names.
- Use another module only through its `index.mjs`, never through a private file of it (`DEVELOP AGAINST INTERFACES`).

## No discussion during the sprint (`docs/process.md`, Sprint)
- You ask nobody anything. A question to akmaier is allowed only when the SPEC and the use cases cannot be implemented as
  specified.
- Where the item, the SPEC or a module file is unclear or wrong, build what the accepted text and the item allow, and note
  the gap in the pull request — file, line, what is unclear, in one or two lines. Do not design around it and do not
  draft a change for it: gaps are discussed at the sprint's end. Stop and report only if the item cannot be built at all
  as specified, saying exactly what cannot be built and why.
- The Product Owner's gate decision is final within the sprint; a rejected pull request is not reworked in the sprint. So
  before you report, go through the item's Acceptance line by line and through the job rules below, and finish whatever
  does not hold yet.

## How you work — the job rules, which are the Definition of Done
1. **Red first.** Write the tests the item's Acceptance names. Each names the module it exercises (`// Module: MOD-<slug>`
   at the top) and the requirement it guards (`// Guards: <names>`, bare identifiers separated by `;`), with its
   expected result readable without running it. Commit only these tests, push the branch and open a pull request into
   `sprint/<nn>`: `gh pr create --repo akmaier/agent-m --base sprint/<nn> --head item/ITM-<nnn>-<slug> --title
   "ITM-<nnn>: <title>"`. CI must be red on this commit (`gh pr checks`).
2. **Green.** Implement in the folders of your item's modules (`src/<slug>/`), as the module files describe, only the
   functions your item needs. Where code under `docs/assets/` does this today, take it as the model; the old file stays
   exactly as it is. Making the dashboard call the modules is a separate change between jobs. Push; CI must be green.
3. **Only your scope changes:** your modules' folders and new test files that name your modules — no existing test, no
   test helper, no file under `docs/` (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`). Every existing test stays
   green unchanged, unless your item names an expected result it changes.
4. **Counter-proofs.** For every new test, plant a fault in the code it guards, run the test, see it fail, remove the
   fault; record each — test, fault, failing output in one line — in the pull request's description.
5. **CI within two minutes** (`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`): unit tests that run in well under a second
   each; nothing in them waits, sleeps or reaches the network.
6. **Local runs** only of your own tests and of the existing tests that import the files you changed, file by file. CI
   runs the whole suite.
7. **Commits** say what they do and end with `Item: ITM-<nnn> · Agent M at <the sprint commit you branched from> ·
   <your participant name> (<your model>)` and the lines your task names.
8. **Do not merge.** The Product Owner decides the merge; the Scrum Master carries it out.

## A change between jobs
When the task names a change between jobs instead of an item (`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`), the sprint's
record says what it changes, and the rules above hold with these differences:
- It changes only files that no module owns, and each change is one of the kinds that requirement names — for instance
  old code of the dashboard calling a module in place of its own code. No module's folder changes.
- The branch is `between/<nn>-<slug>`, the pull request's title `Sprint <nn>, between jobs: <what it changes>`, and its
  description names the kind of change.
- A new test shows the dashboard reaching the module through the change, names the module it reaches, and has a
  counter-proof. Reach the page the way the existing tests of that page do; build no other way.
- Commits end with `Item: — (between jobs) · Agent M at <the sprint commit you branched from> · <your participant name>
  (<your model>)` and the lines your task names.

## Your report (at most 20 lines)
The pull request's address; its commits; the CI result of the tests-only commit (red) and of the last commit (green),
with their addresses; the counter-proofs' count; every file you changed; the gaps you noted; and anything you could not
build as specified, with the reason.
