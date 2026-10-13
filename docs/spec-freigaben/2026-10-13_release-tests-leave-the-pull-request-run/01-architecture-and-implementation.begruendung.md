# 11. Architecture and implementation: release tests leave the run on a pull request into a sprint's branch

**The change.** `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` gains one kind of change: moving the tests of level
`release` out of the run on a pull request into a sprint's branch, into the nightly run and the run on a pull request into
the default branch. Its check names the case. The rest of the section is carried over byte for byte.

**Why.** On the last run of sprint team1/26 the two jobs of `.github/workflows/tests.yml` took 1m42 (node) and 1m48
(python) of their two minutes (`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`), and two runs of that sprint were
cancelled. `tests.yml` is a file no module owns; the kinds the requirement names do not include moving tests between
runs, so no team could make room without this change. akmaier chose, on 2026-10-13, to move tests to the nightly run
rather than to split the jobs or to raise the limit.

**Why by level.** Measured locally on `main` at 4d2ffd77: the python suite takes 90 s over its tests — unit 63 s,
component 13 s, release 14 s —; 49 of the node suite's 301 files are of level `release`. The time is spread thin: the 25
slowest python tests together take about 40 s, none above 6 s, so no single slow test explains it. A choice by level
follows §12: `THE DEFAULT SCHEDULE FOLLOWS THE BOOK` runs `unit`, `component` and `system` on every pull request, and
release tests on a release candidate — none on an item's pull request. A choice by measured time would need a threshold
and a measurement the SPEC does not name.

**Against the rest of the SPEC.** The gate "Release testing → Sprint review" of `scrum-wip` asks for the release tests
green on the sprint's branch: the pull request of a sprint's branch into the default branch still runs them, so the gate
can still be decided. `A RELEASE RUNS EVERY TEST AT EVERY LEVEL` is unaffected. Each job, the new one included, keeps its
two-minute limit.

**What it buys, and what not.** About 15 % of each job's time. Unit tests make up most of the rest and grow with every
item, so the limit will be reached again; the next step would be splitting the jobs, which akmaier did not choose now.

**Impact list.** `tests/test_implementation_job.py` gains a fixture case for the new kind (an implementation item); a
change between jobs then edits `.github/workflows/tests.yml` and `nightly.yml`.
