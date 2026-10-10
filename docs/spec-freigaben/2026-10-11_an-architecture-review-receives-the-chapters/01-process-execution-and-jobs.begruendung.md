# 13. Process execution and jobs: an architecture review receives the book's chapters

**The change.** The requirement `AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND
IMPLEMENTATION` names a job that reviews the architecture beside one that writes or changes it. The rest of the section
is carried over byte for byte.

**Why.** The requirement as accepted names a job that writes or changes the architecture; a review does neither. Asked
whether a review of the architecture receives chapters 9 to 12 as well, the PO answered, 2026-10-11: "Architecture
reviews: Should get chapters 9–12". The PO's words of 2026-10-10, behind the requirement, name "an agent working on
architecture".

**Where.** The requirement itself. Its check stays as it is: it already checks that a job on the architecture receives
chapters 9 to 12 complete.

**Impact list.** No name changes. After acceptance, the job definition of `review-architecture` names the recipe of the
architecture's chapters (MOD-job-catalogue), and the source register's table of these recipes names reviewing beside
writing and changing (MOD-source-register).
