# Review all of the architecture on the real network: where the minute goes

**MEASUREMENT** — 2026-10-18, `main` at `234d3b66`, the GitHub API of `akmaier/agent-m` with a token, macOS, Node 25.9.0.
It stands beside `2026-10-18_page-loads-once-per-commit.md`, whose numbers come from a fake network (its §6: "No time here
is a time on a real network").

## Result

- **The trace graph's reads are the minute.** `traceGraph` over `main` took **70.8 s and 74.3 s** (two runs). It sent **24
  GraphQL requests** of up to 100 files each, 19.0 MB in all, and the sum of their times was 70.3 s of the 70.8 s.
- **Each request takes about 3 s at GitHub, whatever its size.** The 24 requests took 2.4 to 3.5 s each, except the last of
  40 KB, which took 0.8 s. A request of 0.2 MB took as long as one of 1.9 MB.
- **They are sent one after another.** The gap between one answer and the next request was 2 to 13 ms. The cause is
  `readMany` in `src/repository-hosts/index.mjs`, which awaits each batch before sending the next.
- **This corrects the earlier finding** that a stored graph gives Review all of the architecture "no gain" with a token
  (`2026-10-18_page-loads-once-per-commit.md` §0). On a fake network a batch costs one turn of the event loop. On GitHub
  it costs about 3 s.
- Not measured here: the reads of the last accepted texts. `lastAcceptedText` (`src/approvals/status.mjs:131`) reads the
  default branch's commit and whole tree, the history of each approval record, and an earlier commit and its whole tree.
  It does this for each changed file, one file after another (`src/review-pages/flow.mjs:338-358`). At `234d3b66`
  every architecture file is accepted, so there was no changed file to time.

## Method

`docs/measurements` holds no script, so the steps are given here.
1. **Setup.** A clone at `234d3b66`. The page's own functions, imported from `src/`: `connect` (MOD-repository-hosts), with
   `parseAddress("https://github.com/akmaier/agent-m")` and the token of `gh auth token`; then `readSnapshot("main")`, then
   `traceGraph(snapshot, { commit })`, as `graphOnce` hands it to the impact list.
2. **Recording.** `globalThis.fetch` was wrapped to record, for each request, its URL kind, start, duration and the bytes of
   its answer.
3. **Positive controls** (AGENTS.md §6a.2).
   - `readSnapshot("main")` sent 2 requests, 1.42 MB: the commit and the recursive tree, as `snapshot` in
     `src/repository-hosts/github.mjs` reads them.
   - The graph built has 4,963 nodes.
   - `statuses` of the same snapshot gives 17 decisions, 54 modules and 48 use cases, all accepted. This is why there was
     no changed file to time.
