# 12. Tests and continuous integration: Agent M declares its own test schedule

**The change.** `THE TEST SCHEDULE IS DECLARED PER PRODUCT` reads "Agent M and every managed product declare, in a data file
of their own repository, …"; `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE` reads "The CI configuration of Agent M and
of every managed product … is generated from its declared test schedule." Requirement names, rules otherwise and checks are
unchanged. The rest of the section is carried over byte for byte.

**Why.** The SPEC names Agent M and the managed products apart elsewhere ("Agent M and every managed product use the same
layout below `docs/`"; "Each managed product declares exactly one process model"), so "each product" could be read as the
managed products only, and was. Naming Agent M removes that reading. akmaier's decision as in entry 01: within the two
minutes of `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`, the teams decide through Agent M's schedule which tests run on a
pull request and which nightly.

**Against the rest of the SPEC.** `THE DEFAULT SCHEDULE FOLLOWS THE BOOK` applies to Agent M until it declares a schedule.
`A RELEASE RUNS EVERY TEST AT EVERY LEVEL` and `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` are unaffected.

**Impact list.** A schedule file for Agent M, and `tests.yml` and `nightly.yml` generated from it by MOD-test-schedule's
`ciConfiguration` — work for a team, as the next sprint's Product Owner decides.
