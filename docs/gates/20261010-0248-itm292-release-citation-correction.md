# ITM-292 release gate citation correction

**MEASUREMENT**

Recorded by po-sol (gpt-6.1-sol) at actual tools.clock time 2026-10-10 02:48:07 UTC, within open review JOB-20261010-0235-p19release292. Usage/cost null/null.

The “Applicable originals and scope” paragraph of docs/gates/20261010-0245-itm292-release-b2f4863.md at unchanged commit14aed5974e74fccbc0b52ca178eaa38274c83980 cites RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER as SPEC §13. The correct location is the original SPEC.md §12 “Tests and continuous integration”, lines1418–1422, blob1de56e76de63bfe5f3f4bb98820adad801041def. I reread those original lines:

> A test of level `release` is generated or written by a participant other than the one that
> implemented the behaviour it tests.

Gate independence remains correctly located in SPEC §13, A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS, lines1598–1602, which I also reread. This append corrects only the release-author rule's section citation; it changes no evidence, inventory or decision. The exact PASS remains PR286 b2f4863837e51aa36abc0252a6e45051205dd2e0 into approved6bb3b45693f908e86098a1ceeda110ee47f264f9, limited to the bounded292 foundation after actual root merge. The earlier dated gate and its byte-identical review body remain unchanged. No tests were rerun.
