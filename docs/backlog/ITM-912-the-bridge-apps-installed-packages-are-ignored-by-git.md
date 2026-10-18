---
id: ITM-912
title: The Bridge app's installed packages are ignored by git
level: unit
realises:
  - AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
modules:
  - MOD-bridge-build
builds_on:
tests:
  - unit
origin:
  - three accidental commits of `src/bridge-build/node_modules/` — #860 (`6cf99dce`) and #868's first push in sprint team2/89, #873 (`3f40f2dc`, 1,768 files) in sprint team2/90
---
# ITM-912 The Bridge app's installed packages are ignored by git

**REGISTER**

## Outcome

CI installs MOD-bridge-build's packages before the tests: `npm install --prefix src/bridge-build --omit=dev
--ignore-scripts` (`.github/workflows/tests.yml:33`, `:77`). Developers run the same command, which writes
`src/bridge-build/node_modules/`. The root `.gitignore` ignores only `/node_modules/`. On `origin/main` (`f107ebbc`),
`git check-ignore -v --no-index node_modules/x` names `.gitignore:4:/node_modules/`, and
`src/bridge-build/node_modules/x` is not ignored. So `git add -A` commits the installed packages into a job of another
module.

`.gitignore` gains the line `/src/bridge-build/node_modules/`. `.gitignore` is not a code file: MOD-trace-graph's Data
lists no such extension, and neither does `CODE_FILE` in `src/product-process/done.mjs`. No module's file names it, so
`EVERY CODE FILE BELONGS TO A MODULE` does not reach it. The item names MOD-bridge-build, whose `package.json` and
`package-lock.json` are installed into that folder. The probe: with the line appended, `git check-ignore` names
`.gitignore:22:/src/bridge-build/node_modules/`, and `git status` no longer lists the folder.

## Acceptance

- A new test whose header names MOD-bridge-build runs `git check-ignore -v --no-index src/bridge-build/node_modules/x` in
  the repository and finds the line of `.gitignore` that ignores it. The known positive: `node_modules/x` is named by
  `/node_modules/`.
- Counter-proof: without the new line, the test fails. `src/bridge-build/package.json` and `package-lock.json` are not
  ignored.
- The first commit holds only the test, and CI is red on it.
- Only `.gitignore` and the new test change.
