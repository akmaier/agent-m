# 13. Process execution and jobs: a job in a checkout of the instance reads the chapters there

**The change.** The four requirements on the book's chapters say that the input gives the chapters in full, where they
said that it contains them, and their checks build the input both for a job in the browser and for a job in a checkout
of the instance. A new requirement, `A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE`, follows them. The
rest of the section is carried over byte for byte.

**Why.** An agent on a Bridge works in a clone of the instance in its working folder, and a CI agent in the job
workflow's checkout of the instance; either holds the book's chapters already. The PO decided, 2026-10-11, that an agent
which works in a clone of the instance reads the chapters there, instead of being sent them, and that a job in the
browser still receives them in full. As they stood, the four requirements asked that the input contain each chapter,
which a path in a checkout does not.

**Where.** The rule of how a chapter is given in a checkout stands once, in its own requirement after the four; the four
keep saying which chapters each kind of job gets. Repeating it in each of the four would keep four copies of one rule.

**Impact list.** No name changes. The four are named by ARC-046; by UC-005, UC-007 and UC-019 (chapter 8), UC-026
(chapter 13), UC-022 and UC-023 (chapters 9 to 12), UC-024 and UC-034 (chapters 9, 11, 12 and 13); by MOD-source-register;
and by the tests `tests/source-register-chapters.test.mjs` and `tests/test_job_reading.py`, which gain the cases of a job
in a checkout. After acceptance, MOD-source-register's chapter recipes give each chapter's path where the job's context
names a checkout of the instance, and MOD-job-runner's `JobContext` names that checkout.
