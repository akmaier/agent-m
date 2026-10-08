// The #spec adapter calls MOD-trace-pages above its preserved queue history.
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// Level: component
//
// CASE ITM-277-WIRING-01: the fixture resolves main and its actual current SHA; a planted unrelated SHA is refused.
// CASE ITM-277-WIRING-02: the real pinned public route is inserted before queue history and its queue controls still work.

import test from "node:test";
import assert from "node:assert/strict";
import { REPO, TOKEN, repoServer, openDashboard } from "./app-harness.mjs";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const QUEUE = "2026-10-08_current";
const SPEC = `# Fixture\n\n**CURRENT REQUIREMENT** *(Source)*\nCurrent rule.\n*Check:* \`tests/current.test.mjs\`\n`;
const INDEX = "**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n| 01 | `SPEC.md` | # Fixture | — | — |\n";
const FILES = {
  "SPEC.md": SPEC,
  [`docs/spec-freigaben/${QUEUE}/index.md`]: INDEX,
  [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
  [`docs/spec-freigaben/${QUEUE}/01-current.md`]: SPEC,
};

// given: a fixture repository with a known main snapshot
// input: use the public Host to read main, then exactly its returned SHA and an unrelated SHA
// expect: main and its actual SHA read the same SPEC bytes; the unrelated SHA remains not found
test("the fixture resolves its actual current head but refuses an unknown SHA", async () => {
  const server = await repoServer({ files: FILES });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = server.fetch;
  try {
    const host = connect(parseAddress(`https://github.com/${REPO}`), { token: TOKEN });
    const main = await host.readSnapshot("main");
    const current = await host.readSnapshot(main.commit);
    assert.equal(await main.read("SPEC.md"), SPEC, "known positive: main reads the fixture bytes");
    assert.equal(await current.read("SPEC.md"), SPEC, "the actual current SHA reads those same bytes");
    await assert.rejects(host.readSnapshot("f".repeat(40)), /was not found/, "planted fault: an unrelated SHA is refused");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// given: the current fixture SPEC and one open legacy queue
// input: open #spec through the dashboard's pinned snapshot and address the preserved queue control
// expect: the public requirements view precedes the queue, and the existing queue control remains reachable
test("#spec composes the pinned requirements view before preserved queue history", async () => {
  const server = await repoServer({ files: FILES });
  const page = await openDashboard({ server, hash: "#spec" });
  const html = page.main();
  const overview = html.indexOf("Current requirements"), history = html.indexOf("SPEC changes");
  const requirement = html.indexOf("CURRENT REQUIREMENT"), queue = html.indexOf(`id=\"queue-${QUEUE}\"`);
  assert.ok(overview >= 0 && requirement >= 0, "known positive: the public overview is present");
  assert.ok(history >= 0 && queue >= 0, "known positive: the preserved queue history is present");
  assert.ok(overview < history && requirement < queue, "the overview precedes the queue history");
  assert.deepEqual(server.writes, [], "opening the composed page writes nothing");
  await page.click("[data-accept-ticked]");
  assert.deepEqual(server.writes, [], "the preserved queue control remains reachable without writing");
});
