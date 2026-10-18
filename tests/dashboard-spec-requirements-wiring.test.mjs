// The #spec adapter calls MOD-trace-pages beside the open SPEC changes.
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// Level: component
//
// CASE ITM-277-WIRING-01: the fixture resolves main and its actual current SHA; a planted unrelated SHA is refused.
// CASE ITM-277-WIRING-02: the real pinned public route is on the page with the open SPEC changes, and their queue controls still work.

import test from "node:test";
import assert from "node:assert/strict";
import { REPO, TOKEN, repoServer, openDashboard } from "./app-harness.mjs";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const QUEUE = "2026-10-08_current";
const SPEC = `# Fixture\n\n**CURRENT REQUIREMENT** *(Source)*\nCurrent rule.\n*Check:* \`tests/current.test.mjs\`\n`;
const INDEX = "# SPEC approvals — queue fixture\n\n**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n|---|---|---|---|---|\n| 01 | `SPEC.md` | # Fixture | — | — |\n";
const FILES = {
  "SPEC.md": SPEC,
  [`docs/spec-freigaben/${QUEUE}/index.md`]: INDEX,
  [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
  [`docs/spec-freigaben/${QUEUE}/01-current.md`]: SPEC,
};

// TST-472147 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
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

// TST-472148 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: the current fixture SPEC and one open legacy queue
// input: open #spec through the dashboard's pinned snapshot and address the preserved queue control
// expect: the open entry of the queue stands first, as a link, under "SPEC changes waiting for acceptance", and the public requirements view below it; the queue's control (Accept ticked) is not on this page and is reachable on #spec-entry
test("#spec shows the open SPEC changes first and the pinned requirements below; the queue control stays reachable on #spec-entry", async () => {
  const server = await repoServer({ files: FILES });
  const page = await openDashboard({ server, hash: "#spec" });
  const html = page.main();
  const waiting = html.indexOf("SPEC changes waiting for acceptance"), overview = html.indexOf("Current requirements");
  const requirement = html.indexOf("CURRENT REQUIREMENT"), queue = html.indexOf(`href="#spec-entry/id=spec-${QUEUE}-01"`);
  assert.ok(overview >= 0 && requirement >= 0, "known positive: the public overview is present");
  assert.ok(waiting >= 0 && queue > waiting && queue < overview, "the open entry is linked in the waiting section, above the overview");
  assert.equal(html.includes("accept-ticked"), false, "the list's controls are not on #spec");
  assert.deepEqual(server.writes, [], "opening the composed page writes nothing");
  await page.go("#spec-entry");
  await page.click(".accept-ticked");
  assert.deepEqual(server.writes, [], "the preserved queue control remains reachable without writing");
});
