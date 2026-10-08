// The current requirement overview through the actual #spec dashboard route (ITM-277).
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// Level: system

import assert from "node:assert/strict";
import test from "node:test";
import { TOKEN, openDashboard, repoServer } from "./app-harness.mjs";

const QUEUE = "2026-10-08_wording";
const OLD = `# Fixture specification

**OUTSIDE REQUIREMENT** *(Outside source)*
Outside rule.
*Check:* \`tests/outside.test.mjs\`

## First section

**FIRST REQUIREMENT** *(First source)*
First rule.
*Check:* \`tests/first.test.mjs\`

## Second section

**SECOND REQUIREMENT** *(Second source)*
Second rule.
*Check:* \`tests/second.test.mjs\`
`;
const CURRENT = OLD.replace("SECOND REQUIREMENT", "FRESH REQUIREMENT").replace("Second rule.", "Fresh current rule.");
const PROPOSAL = OLD.replace("SECOND REQUIREMENT", "PROPOSED ONLY REQUIREMENT").replace("Second rule.", "Proposal text only.");

function files(spec = OLD) {
  return {
    ...(spec === null ? {} : { "SPEC.md": spec }),
    [`docs/spec-freigaben/${QUEUE}/index.md`]: [
      "# Queue",
      "",
      "**Zieldatei aller Einträge:** `SPEC.md`",
      "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |",
      "|---|---|---|---|---|",
      "| 01 | `SPEC.md` | ## Second section | — | — |",
      "",
    ].join("\n"),
    [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n",
    [`docs/spec-freigaben/${QUEUE}/01-proposal.md`]: PROPOSAL,
  };
}

const count = (text, needle) => text.split(needle).length - 1;
const writes = (server) => server.requests.filter((request) => /^(write|other|handler) (?!GET )/.test(request));

// CASE ITM-277-SYSTEM-01
// given: the real dashboard at #spec, a pinned SPEC with an outside requirement and two sections, and an open queue
// input: open the route and select OUTSIDE REQUIREMENT
// expect: every current name is shown once in file order before queue history; selection stays in the page and shows all four fields
test("#spec shows current requirements once in order before queue history and opens their four fields in place", async () => {
  const server = await repoServer({ files: files() });
  const page = await openDashboard({ server, hash: "#spec" });
  const overview = page.main();
  for (const name of ["OUTSIDE REQUIREMENT", "FIRST REQUIREMENT", "SECOND REQUIREMENT"]) {
    assert.equal(count(overview, name), 1,
      `known positive: ${name} is one selectable current requirement`);
  }
  const positions = ["Current requirements", "OUTSIDE REQUIREMENT", "First section", "FIRST REQUIREMENT", "Second section", "SECOND REQUIREMENT", "SPEC changes"]
    .map((text) => overview.indexOf(text));
  assert.ok(positions.every((at) => at >= 0), "known positive: overview and preserved history are present");
  assert.ok(positions.every((at, index) => index === 0 || positions[index - 1] < at), "file order is preserved above queue history");
  assert.doesNotMatch(overview, /PROPOSED ONLY REQUIREMENT/, "a queue proposal is not a current requirement");

  await page.click("button.requirement-name");
  const opened = page.main();
  for (const field of ["OUTSIDE REQUIREMENT", "Outside source", "Outside rule.", "tests/outside.test.mjs"]) {
    assert.match(opened, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `selected requirement exposes ${field}`);
  }
  assert.match(opened, new RegExp(`id="queue-${QUEUE}"`), "the existing queue remains in the page after selection");
  assert.equal(writes(server).length, 0, "opening and selecting are reads");
});

// CASE ITM-277-SYSTEM-02
// given: a fresh dashboard load after current SPEC bytes change, then fixtures with an empty and an absent SPEC
// input: open #spec for each fixture
// expect: only fresh current text appears; empty and absent SPECs name their empty state while queue history remains usable
test("#spec reads fresh current SPEC bytes and keeps queue history for empty or absent SPEC", async () => {
  const changing = await repoServer({ files: files() });
  await openDashboard({ server: changing, hash: "#spec" });
  await changing.change("SPEC.md", CURRENT);
  const fresh = await openDashboard({ server: changing, hash: "#spec" });
  assert.match(fresh.main(), /FRESH REQUIREMENT/, "known positive: a fresh page reads the changed current SPEC");
  assert.doesNotMatch(fresh.main(), /SECOND REQUIREMENT|PROPOSED ONLY REQUIREMENT/, "neither old bytes nor proposal text replace current SPEC");

  for (const [label, spec] of [["empty", ""], ["absent", null]]) {
    const server = await repoServer({ files: files(spec) });
    const page = await openDashboard({ server, hash: "#spec" });
    assert.match(page.main(), /No current requirements are recorded in SPEC\.md\./, `${label} SPEC states the explicit empty result`);
    assert.match(page.main(), new RegExp(`id="queue-${QUEUE}"`), `${label} SPEC preserves the queue history`);
    assert.equal(writes(server).length, 0, `${label} overview writes nothing`);
  }
});
