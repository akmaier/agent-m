---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 628851d38eee62947436ffa15351574e749e91be
  - https://github.com/akmaier/agent-m/pull/998
date: 2026-10-19 10:02 UTC
---
# Development → Release testing: ITM-1071, passed — a button and text on one line stand apart, from look.css

**REGISTER**

## Reason

ITM-1071 (MOD-site-frame), pull request #998 into `sprint/team1/93`, passes on `628851d3`.

- **Commits,** all with the trailer `developer-sonnet-a`:
  - `f2488646` holds only tests;
  - `80a1d5f2` was the first code, in `lme.css`;
  - `1f0384d1` merges #999's head, and its `git show --cc` is empty;
  - `dc427202` holds only tests;
  - `628851d3` holds the code.
- **The reds:**
  - `f2488646`: TST-1071001.
  - `dc427202`, run 39233090846: `# fail 2`, `# todo 0`, `# cancelled 0`, exactly TST-1071003 (every page that drew its
    buttons from `lme.css` links `look.css` after it) and TST-1071004 (the buttons section with the gap rule stands in
    `look.css` and not in `lme.css`).
- **The code follows the ruling of 93.md and SPEC.md:1456-1458.**
  - The buttons section of `lme.css` moves, with the gap rule, into `src/site-frame/look.css`.
  - `docs/index.html` and `index.html` link `look.css` after `lme.css`.
  - The rest of `lme.css` stays.
- **The Bridge's window.**
  - It loads `look.css` without `lme.css`, but `src/desktop-shell/window.mjs:4` draws plain `button` elements and no
    `.btn`, so no `.btn` rule there needs `--fg` or `--accent`.
  - Its buttons get the gap, which SPEC.md:936-937 asks of every page.
- **CI:** 20 of 20 checks passed on the head.
- **Merge-tree:** `git merge-tree --write-tree` is clean onto `sprint/team1/93` (`baa42634`) and onto #999's head `c3a0ff3e`.
  #999 merges first.
- **Replayed in a clean worktree at the head,** with a temporary folder of its own: a stale controlled-Electron lock from
  2026-10-17 holds the shared one.
  - `tests/site-frame-button-gap.test.mjs` passes 4 of 4.
  - Counter-proof: without the gap rule in `look.css`, TST-1071001 and TST-1071004 fail.
