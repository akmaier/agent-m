// The current requirement overview remains a read-only dashboard view (ITM-277).
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// Level: release

import assert from "node:assert/strict";
import test from "node:test";
import { TOKEN, openDashboard, repoServer } from "./app-harness.mjs";

const SPEC = `# Read-only fixture

**READ-ONLY REQUIREMENT** *(Source)*
The current rule is readable.
*Check:* \`tests/read-only.test.mjs\`
`;
const QUEUE = "2026-10-08_readonly";
const FILES = {
  "SPEC.md": SPEC,
  [`docs/spec-freigaben/${QUEUE}/index.md`]: "# Queue\n\n**Zieldatei aller Einträge:** `SPEC.md`\n\n| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n|---|---|---|---|---|\n| 01 | `SPEC.md` | # Read-only fixture | — | — |\n",
  [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n",
  [`docs/spec-freigaben/${QUEUE}/01-current.md`]: SPEC,
};
const writes = (server) => server.requests.filter((request) => /^(write|other|handler) (?!GET )/.test(request));

// CASE ITM-277-RELEASE-01
// given: the real #spec route, once with the dashboard's stored token and once with none
// input: open the current overview and select its displayed requirement
// expect: the known current requirement is readable in both routes, and neither route writes a repository
test("the release dashboard reads and opens current requirements without writes with or without a token", async () => {
  for (const [label, token] of [["stored token", TOKEN], ["no token", null]]) {
    const server = await repoServer({ files: FILES });
    const page = await openDashboard({ server, hash: "#spec", token });
    assert.match(page.main(), /READ-ONLY REQUIREMENT/, `${label}: known positive, the current overview rendered`);
    await page.click("button.requirement-name");
    assert.match(page.main(), /The current rule is readable\./, `${label}: known positive, selection rendered the current rule`);
    assert.deepEqual(writes(server), [], `${label}: overview and selection make no write request`);
    assert.deepEqual(server.writes, [], `${label}: the repository remains unchanged`);
  }
});
