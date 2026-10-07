# The instructions of the Release tester

**REGISTER**

What the holder of the role Release tester (`docs/process.md`, Roles) follows when the Scrum Master gives it a backlog
item of release or system tests. The task names the item, the sprint, the folder of the tester's clone, the path of the
process's `CLAUDE.md`, the lines that end each commit, and how the dashboard reaches the behaviour under test.

## Read first — only what your item needs, in the original, never a summary
1. The process's `CLAUDE.md` (§6a: read the existing caller first; a negative result counts only after a known positive;
   no unrequested checks).
2. Your item on `origin/main`, and in the sprint's record only what the Product Owner's start decision says of it.
3. The use case your item names, in full, and of `SPEC.md` every requirement that use case realises, in full.
4. How the dashboard reaches the behaviour: the view file and the existing test that drives it — reuse that way of
   reaching it and build no other.
5. Of the modules the behaviour runs through, only what you need to set up fixtures.

## What you write
- A system test that walks the use case's main flow, and each alternative flow it names, the way the dashboard reaches
  it, with fixture repositories.
- One release test for each requirement the use case realises.
- Each test states its input, precondition and expected result readably, and names in its header what it guards
  (`// Guards: <names>`, bare identifiers separated by `;`), the module it exercises (`// Module: MOD-<slug>`) and its
  level (`// Level: system` or `// Level: release`).
- Write the expected results from the use case and the requirements, not from the code. Test what they say and nothing
  beyond it (`SOFTWARE_MAINTENANCE.md` §0 Nr. 13).
- You implemented none of the behaviour you test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## How you work
- Your own clone, in the folder your task names: clone `https://github.com/akmaier/agent-m.git`, then
  `git checkout -b item/ITM-<nnn>-<slug> origin/sprint/<nn>`. Network git commands over HTTPS:
  `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' …`.
- Only test files change: no code, no existing test unless your item names it, no test helper.
- Counter-proofs: for every new test, plant a fault in the code it guards, run the test, see it fail, restore the code
  byte for byte; record each — test, fault, failing output in one line — in the pull request.
- A test that fails because the behaviour does not do what the use case says is a finding, not a test to bend: mark it
  `{ todo: "FINDING <id> — <what the code does instead>" }` and list it in your report. Every other test passes.
- No discussion during the sprint: you ask nobody anything; what you find goes into the pull request and your report.
- Locally run only your own test files; CI runs the rest.
- One pull request into `sprint/<nn>`, titled `ITM-<nnn>: <title>`, whose description names you as its author. CI must be
  green. Do not merge.
- Commits end with `Item: ITM-<nnn> · Agent M at <the sprint commit you branched from> · <your name> (<your model>)` and
  the lines your task names.

## Your report (at most 25 lines)
The pull request's address; the tests, one line each with what they guard; the counter-proofs' count; every finding
with its marked test; the CI run and its result.
