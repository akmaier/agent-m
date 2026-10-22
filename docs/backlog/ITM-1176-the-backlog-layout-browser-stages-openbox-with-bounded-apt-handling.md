---
id: ITM-1176
title: The backlog-layout browser stages Openbox with bounded apt handling
level: system
realises:
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-543
tests:
  - system
origin:
  - Sprint team1/109 CI39762650551 attempts1/2/3, TST-919001 Openbox setup failure before browser geometry; ITM-543's explicitly excluded backlog-layout fixture
---
# ITM-1176 The backlog-layout browser stages Openbox with bounded apt handling

**REGISTER**

## Outcome

The Linux setup of `tests/dashboard-backlog-layout.test.mjs` uses the repository's existing bounded apt lock/mirror
handling and reports an actual setup failure without passing, skipping or changing the browser's expected results.
Only this file's fixture preparation and its matching explanatory prose are in scope; no production behaviour,
workflow, other module's helper, package version, geometry collector or browser assertion changes.

The current path is TST-919001 -> `electronCommand` -> missing Openbox -> plain
`sudo apt-get install --yes --no-install-recommends openbox` with a 40000ms `spawnSync` limit ->
`assert.equal(install.status, 0)` at line61. CI39762650551 attempts1/2/3 reach that assertion with null status and
"Linux Openbox installation failed" before browser layout runs. This is not an observed chart regression.

The fixture asks apt to wait for the package lock and retry acquisition, using the existing settings-fixture pattern
`-o DPkg::Lock::Timeout=50 -o Acquire::Retries=3`, with a 60000ms install bound within the existing test/job limits.
A nonzero, signalled or timed-out install still fails setup. Its diagnostic identifies the command/stage and actual
status, signal, process error, elapsed time and captured output, following the existing native-fixture evidence
pattern rather than substituting a successful retry or claiming geometry ran.

## Readiness and nonduplication

ITM-541, ITM-543 and ITM-557 are delivered (PR587, PR592 and PR605 respectively); their existing owned calls already
have the lock/retry handling. This item does not reopen or duplicate them. ITM-543 explicitly omitted this file
because its old header named MOD-dashboard-app. Its current header names MOD-implementation-pages, and that accepted
module's Parts explicitly take over the file. No formal or ownership change is needed.

The shared Frame browser and Desktop-shell fixtures already use 60000ms and the apt options, yet retained109 logs
also show failures there. Those are distinct observed setup paths, not evidence that this file's change cures them
or that all failures have one root cause. This item is only the still-unimplemented omission in the backlog fixture.
It is backlog work, not selected for109 or a decision to start110; any implementation waits for a fresh selection and
recorded assignment. Release job f9ea remains active and no sprint-close completion is inferred.

## Acceptance

- The existing Linux preparation uses the bounded lock/retry pattern above. A controlled successful preparation
  reaches the existing browser case; an actual failed install remains a named setup failure with its real process
  evidence. Retain all attempts and distinguish stand-in command checks from an actual Linux/browser execution.
- TST-919001 remains a system case with its original route inputs, 390/1280 widths, literal geometry expectations,
  unconditional body-sized chart text checks, visible-label controls, plotted values, line widths and contrast.
  No old expected result, ID, level, fixture product data, skip/TODO or timeout of the test/job changes.
- This changes preparation only and adds no product behaviour. Any new test follows the existing proof rules;
  no new test quota or repeated first-red obligation is imposed for maintaining the old case.

## Design Reading

SRP keeps the omission with the module that owns this one fixture. DRY reuses the established apt/evidence convention,
without introducing another global staging mechanism. KISS/YAGNI limit the work to the observed missing handling,
preserve failure visibility, and do not turn unrelated installation failures into a claimed common diagnosis.
