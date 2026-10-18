// An EU legal text registered on the page waits for its fetch (ITM-914) — MOD-source-register's recogniseLegalText reads "a CELEX number or an ELI given by itself, as a register entry's `identifier` holds it"
// (docs/architecture/MOD-source-register.md, Interfaces), and an entry "whose `identifier` `recogniseLegalText` recognises and whose `## Versions` has no row yet" is an EU legal text that waits for its fetch (Data),
// which MOD-settings-pages' route `library` shows with its state and, after a failed run, *Fetch again* (UC-004 7, 7a). The library's form writes the bare CELEX number as the entry's `identifier` (UC-004 4).
// The route is rendered into the fixture DOM of tests/settings-pages-harness.mjs over MOD-repository-hosts' real GitHub host, answered by a fake of fetch (tests/settings-pages-sources.d/github.mjs) to which this file
// adds the instance's workflow runs, their jobs and logs, and the dispatch of a workflow; nothing reaches the network.
// Run: node --test tests/source-register-legal-text-waiting.test.mjs
//
// Module: MOD-source-register; MOD-settings-pages
// Guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// Each test names its input and states its expected result in its own text (given / input / expect); no expected value is read from a document, and none from the code. The counter-proofs (a planted fault in
// src/source-register/ and the test's failing result) are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, byClass, click } from "./settings-pages-harness.mjs";
import { attachedTarget, freshStore } from "./settings-pages-setup.d/dom.mjs";
import { githubWorld, installWorld } from "./settings-pages-sources.d/github.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { writeSetting } = await import("../src/browser-store/index.mjs");
const { connect, parseAddress } = await import("../src/repository-hosts/index.mjs");
const { recogniseLegalText } = await import("../src/source-register/index.mjs");
const library = view.routes.find((candidate) => candidate.name === "library");

const INSTANCE = "akmaier/agent-m";
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
const entryText = (id, identifier) => ["---", `id: ${id}`, `title: ${id} text`, "kind: regulation", "authority: normative", "licence: may be republished — EU law", `identifier: ${identifier}`, "---",
  `# ${id} ${id} text`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", ""].join("\n");

// The page over a world of the instance holding the entries given; `failed` adds a failed run of fetch-sources.yml whose log names SRC-ai-act. `dispatched` lists the workflows started.
async function open(t, entries, { failed = false } = {}) {
  const world = githubWorld({ [INSTANCE]: { files: Object.fromEntries(entries.map(([id, identifier]) => [`docs/sources/${id}.md`, entryText(id, identifier)])) } });
  installWorld(t, world);
  const dispatched = [];
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    const base = `/repos/${INSTANCE}/actions`;
    if (method === "GET" && url.pathname === `${base}/workflows/fetch-sources.yml/runs`) {
      return json({ workflow_runs: failed ? [{ id: 1, path: ".github/workflows/fetch-sources.yml", head_sha: "h".repeat(40), event: "push", status: "completed", conclusion: "failure",
        html_url: `https://github.com/${INSTANCE}/actions/runs/1`, run_started_at: "2026-10-14T10:00:00Z", updated_at: "2026-10-14T10:01:00Z" }] : [] });
    }
    if (method === "GET" && url.pathname === `${base}/runs/1/jobs`) return json({ jobs: [{ id: 11, name: "fetch" }] });
    if (method === "GET" && url.pathname === `${base}/jobs/11/logs`) return new Response("onSourcesCommitted: failed - SRC-ai-act: Unreachable: publication offline\n", { status: 200 });
    if (method === "POST" && url.pathname === `${base}/workflows/fetch-sources.yml/dispatches`) { dispatched.push(JSON.parse(init.body)); return new Response(null, { status: 204 }); }
    return world.fetch(input, init);
  };
  const store = freshStore();
  writeSetting(store, "github-token", { value: TOKEN, name: "Agent M", expires: "2027-01-01" });
  const context = { page: "review", instance: { repository: INSTANCE, host: connect(parseAddress(`https://github.com/${INSTANCE}`), { token: TOKEN }) }, product: null, store, went: [], go() {} };
  const target = attachedTarget();
  await library.render(target, context, {});
  return { target, dispatched };
}
const sectionOf = (page, id) => byClass(page.target, "library-source").find((node) => node.textContent.includes(`${id} ·`));

// TST-914001 · level: unit · module: MOD-source-register
// guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
// given: the register entry's identifier as the library's form writes it, the AI Act's bare CELEX number "32024R1689", and the ELI as the form writes it, "http://data.europa.eu/eli/reg/2024/1689/oj"
// input: recogniseLegalText for each
// expect: { celex: "32024R1689" } for the number and { eli: "http://data.europa.eu/eli/reg/2024/1689/oj" } for the ELI
test("recogniseLegalText — a CELEX number given by itself, and an ELI given by itself, are recognised as an entry's identifier holds them", () => {
  assert.deepEqual(recogniseLegalText("32024R1689"), { celex: "32024R1689" });
  assert.deepEqual(recogniseLegalText("http://data.europa.eu/eli/reg/2024/1689/oj"), { eli: "http://data.europa.eu/eli/reg/2024/1689/oj" });
});

// TST-914002 · level: unit · module: MOD-source-register
// guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
// given: the library's other identifiers — a consolidated CELEX number "02016R0679-20160504", and texts that are neither a CELEX number nor an ELI: "32024R1689x", "3202R1689", "CELEX:32024R1689", "ABC", "/eli/reg/2024/1689/oj", the empty text
// input: recogniseLegalText for each
// expect: { celex: "02016R0679-20160504" } for the consolidated number, which the form's own recogniser accepts in an address; null for every other
test("recogniseLegalText — a consolidated CELEX number is recognised by itself, and a text that is no CELEX number is not", () => {
  assert.deepEqual(recogniseLegalText("02016R0679-20160504"), { celex: "02016R0679-20160504" }, "known positive");
  for (const text of ["32024R1689x", "3202R1689", "CELEX:32024R1689", "ABC", "/eli/reg/2024/1689/oj", ""]) assert.equal(recogniseLegalText(text), null, JSON.stringify(text));
});

// TST-914003 · level: unit · module: MOD-settings-pages
// guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the library holds the entry SRC-ai-act with the bare identifier 32024R1689 and no version row, and SRC-ai-eli with the ELI as its identifier and no version row (a known positive); no run of the fetch workflow
// input: the route `library`
// expect: each of the two shows "Waiting for fetch." and one button Fetch again
test("library — an EU legal text registered with its bare CELEX number shows that it waits for its fetch, with Fetch again", async (t) => {
  const page = await open(t, [["SRC-ai-act", "32024R1689"], ["SRC-ai-eli", "http://data.europa.eu/eli/reg/2024/1689/oj"]]);
  for (const id of ["SRC-ai-eli", "SRC-ai-act"]) {
    assert.deepEqual(byClass(sectionOf(page, id), "library-fetch-state").map((node) => node.textContent), ["Waiting for fetch."], id);
    assert.equal(byClass(sectionOf(page, id), "library-fetch-again").length, 1, id);
  }
});

// TST-914004 · level: unit · module: MOD-settings-pages
// guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY; ONE CLICK PER DECISION
// given: the entry SRC-ai-act with the bare identifier 32024R1689 and no version row; the latest run of fetch-sources.yml failed, its log naming SRC-ai-act ("Unreachable: publication offline")
// input: the route `library`; press Fetch again
// expect: the entry shows "Fetch failed: " and the log's line, which names "publication offline", and one Fetch again; the press starts fetch-sources.yml once, with the ref main and no input
test("library — after a failed run an EU legal text registered with its bare CELEX number shows the failure and Fetch again, which starts the workflow", async (t) => {
  const page = await open(t, [["SRC-ai-act", "32024R1689"]], { failed: true });
  const section = sectionOf(page, "SRC-ai-act");
  const state = byClass(section, "library-fetch-state").map((node) => node.textContent);
  assert.equal(state.length, 1);
  assert.equal(state[0].startsWith("Fetch failed: ") && state[0].includes("publication offline"), true, state[0]);
  const again = byClass(section, "library-fetch-again");
  assert.equal(again.length, 1);
  await click(again[0]);
  assert.deepEqual(page.dispatched, [{ ref: "main", inputs: {} }]);
});
