---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9f378613557fe2cd191e45739e13e1c662233fc9
  - https://github.com/akmaier/agent-m/pull/987
date: 2026-10-19 09:03 UTC
---
# Development → Release testing: ITM-907, passed — traceGraph reads the graph stored for its commit

**REGISTER**

## Reason

ITM-907 (MOD-trace-graph, MOD-repository-hosts), pull request #987 into `sprint/team1/93`, passes on `9f378613`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-a`.**
  - `8c713a93` and `bbe2d4ec` hold only tests.
  - `9f378613` holds only code: `src/trace-graph/` and `src/repository-hosts/index.mjs`.
- **The red,** run 39226118487 on `bbe2d4ec`, each job with `# cancelled 0`:
  - node (9): `# fail 3`: `graphText`/`graphFromText`, the stored graph read, and the fallback.
  - node (7): `# fail 3`: `readOn` with a token, without one, and `null` for a missing file or branch. Its 2 todo are
    findings of A RECORD IS EVIDENCE, NOT A PROPOSAL, which this item does not touch.
  - node (2): `# fail 4`: the request counts of `tests/system-itm-599-gaps-view.test.mjs`. This is a system test, and it
    changes as this item's output.
- **The code meets the accepted texts.** It matches MOD-trace-graph.md:66, :175 and :210-213 (`graphText`,
  `graphFromText`, the read of `<commit>.json` on `trace-cache`), and MOD-repository-hosts.md:107 and :115 (`readOn`).
  `publishGraph` remains unbuilt. ITM-908 builds the writer.
- **SPEC.md:672-675 A PAGE LOAD READS THE REPOSITORY IN BATCHES.**
  - Until a graph is stored, a page that passes its commit reads `<commit>.json` once more: one text in one request, which
    finds nothing.
  - The sentence names what a load reads in batches of at most 100 files. One text in one request stays within that. It
    does not say that a load reads nothing else.
  - `tests/load-per-view.test.mjs` passes at the head. It does not see `readOn`, though: with `readOn` called three times
    it still passes 26 of 26, while `system-itm-599-gaps-view` fails 4. Its pass is therefore no evidence about this read.
  - The extra request goes once ITM-908 stores the graphs.
- **CI:** run 39226425062 passed on the head, 20 of 20.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`0c265229`) is clean.
- **Replayed in a clean worktree at the head:**
  - `repository-hosts-read-on`, `trace-graph-stored`, `system-itm-599-gaps-view` and `load-per-view` pass 39 of 39.
  - Counter-proof: with the stored graph never read, `trace-graph-stored` fails exactly its two `traceGraph` cases.
