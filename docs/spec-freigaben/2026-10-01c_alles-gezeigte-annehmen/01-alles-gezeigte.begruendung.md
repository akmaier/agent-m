# §10: a review page shows every open file of an area, and one click accepts what it showed

**What happened.** The restructured architecture (PR #22 and the follow-up) changed 18 decisions and 34 modules;
the PO accepted them file by file. `SEVERAL FILES ARE ACCEPTED IN ONE CLICK` already allows one commit for many
files, but only for files the reviewer has *opened* — its check: "none for a file that was not opened".

**PO decision, 2026-10-01: option (A).** Not chosen: (B) accepting every open file without showing it — faster,
but an approval would then no longer say that the text was seen, which empties `A GENERATED ARTIFACT IS A
PROPOSAL`; a generated file is likely right, not certainly (the leaking module boundaries and the stale
"pseudonymised" wording of 2026-10-01 were in generated files).

**The change:** "opened" becomes "shown — opened one by one, or together on one review page". The occasion
describes the review page: every open file of one area in sequence, a changed file as its difference to the last
accepted text (`A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`), a new file in full, a withdrawn file
with its note, an architecture change with its impact list (`AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN
IMPACT LIST`). The check gains the case of a file the page could not show because a requirement it names is
still open (`ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`). The rest of §10 is carried over byte for byte.

**Impact list:** `SPEC.md`; UC-008 (3d), UC-022 (step 10), UC-023 (step 5) — updated in the same commit, open
for review; code: `docs/assets/review-app.mjs` (the review page and its button) and `review-core.mjs`
(`planAcceptance` already writes one record per file), after acceptance, with a failing test first.
