---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9495474dc22d6b788baa8057d4ed2822c6ffe094
  - https://github.com/akmaier/agent-m/pull/1033
date: 2026-10-19 11:38 UTC
---
# Development → Release testing: ITM-1018, passed — a drawn diagram follows the site's colour scheme

**REGISTER**

## Reason

ITM-1018 (MOD-markdown-render), pull request #1033 into `sprint/team1/93`, passes on `9495474d`. akmaier asked for it.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `5b626af7` holds only tests: `tests/markdown-render-1018-scheme.test.mjs`.
  - `9495474d` holds the code: `src/markdown-render/mermaid.mjs`.
- **The red,** run 39245347431, job 118035805966: `# fail 3`, `# todo 0`, `# cancelled 0`, exactly TST-1018001 to 003.
- **The code meets `renderMermaid` as akmaier accepted it at `8f4f6b0b`, which `sprint/team1/93` (`8f012c4b`) holds.**
  - The diagram takes the library's `dark` theme where the browser prefers dark and the root does not carry
    `data-theme="light"` (`mermaid.mjs:15`), else `default`.
  - It is drawn again in its own element when the preference or `data-theme` changes.
  - A diagram that does not parse shows its message and source in either scheme.
- **The readings stand:**
  - a diagram is drawn again only while it is in the document;
  - a change that leaves the scheme as it was draws nothing;
  - a browser without `matchMedia` has the light scheme.
- **CI:** run 39245684385 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`8f012c4b`) is clean.
- **Replayed in a clean worktree at the head:**
  - `markdown-render-1018-scheme` and `markdown-render-342` pass 10 of 10.
  - Counter-proof: with `data-theme` ignored, 2 fail.
