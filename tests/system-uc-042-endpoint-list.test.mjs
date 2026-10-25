// The model endpoints on the Settings page (UC-042 steps 1 and 2, UC-003): what the page shows of the endpoints this browser
// keeps, right after the in-place form stored, tested or cleared one, and across the page's own renders.
// Run: node --test tests/system-uc-042-endpoint-list.test.mjs
//
// Module: MOD-settings-pages · MOD-browser-store · MOD-endpoint-calls
// Level: system
// Guards: UC-042; UC-003; EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Guards: CONFIGURATION LIVES IN THE BROWSER
//
// The endpoint servers below are controlled in-process handlers of the existing dashboard harness. No provider is called.
// Counter-proofs: each TST's named source fault was planted, its case failed at the stated assertion, and the byte was restored.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, press, repoServer, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const prefix = `agent-m:${INSTANCE}:`;
const CAMPUS = { name: "campus", url: "https://models.example.test/v1", kind: "openai-compatible", model: "tiny-model", key: "campus-key" };
const LAB = { name: "lab", url: "https://lab.example.test/v1", kind: "openai-compatible", model: "lab-model", key: "lab-key" };

const stored = (key) => JSON.parse(globalThis.localStorage.getItem(`${prefix}${key}`));
const record = (endpoint) => JSON.stringify({ url: endpoint.url, kind: endpoint.kind, model: endpoint.model, throughBridge: false, key: endpoint.key });
const answering = (endpoint, status = 200) => async (url) => {
  if (url.href !== `${endpoint.url}/chat/completions`) return null;
  return status === 200
    ? new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status })
    : new Response(JSON.stringify({ error: { message: "Invalid API key." } }), { status });
};

// The dashboard at #settings, with the children the page mounted kept, as the other system tests of this page keep them.
async function settingsPage({ handlers = [], entries = {} } = {}) {
  const server = await repoServer({ files: {}, handlers });
  const page = await openDashboard({ server, hash: "#uc", entries });
  const main = richDocument().byId("main");
  let mounted = [];
  const replace = main.replaceChildren.bind(main);
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  await page.go("#settings");
  return { server, dashboard: page, main, mounted: () => mounted };
}

const tabsOf = (page) => page.mounted().find((node) => node.className === "settings-tabs").querySelectorAll(".settings-tab");
const selectedTab = (page) => tabsOf(page).filter((tab) => tab.getAttribute("aria-selected") === "true").map((tab) => tab.textContent);
const paneOf = (page) => page.mounted().find((node) => node.className === "settings-tab-panel" && /Endpoints & Agents/.test(node.textContent));
const linesOf = (page) => paneOf(page).querySelectorAll("section.settings-endpoint");
const lineOf = (page, name) => linesOf(page).find((line) => line.querySelector("h3").textContent === `Endpoint: ${name}`);

async function openEndpointsTab(page) {
  await press(page.server, tabsOf(page).find((tab) => tab.textContent === "Endpoints & Agents"));
}

async function saveAndTest(page, endpoint) {
  await press(page.server, paneOf(page).querySelector("button.settings-endpoint-configure"));
  const form = paneOf(page);
  form.querySelector(".endpoint-name").value = endpoint.name;
  form.querySelector(".endpoint-url").value = endpoint.url;
  form.querySelector(".endpoint-kind").value = endpoint.kind;
  form.querySelector(".endpoint-model").value = endpoint.model;
  form.querySelector(".endpoint-key").value = endpoint.key;
  await press(page.server, form.querySelector(".endpoint-test"));
  return form.querySelector(".endpoint-result").textContent;
}

// Module (as the case stated it): MOD-settings-pages → MOD-browser-store
// TST-290132 · level: system · module: MOD-settings-pages
// guards: UC-042; UC-003; EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: Settings is open in a browser that keeps no endpoint; the endpoint answers its test request.
// input: the author opens Endpoints & Agents, presses Configure a model endpoint, fills the endpoint campus and presses Save and test; then presses Clear in the same form.
// expect: right after Save and test, the tab lists the endpoint campus beside the form, which still shows that the model is working, and Endpoints & Agents stays the selected tab; right after the form's Clear, the tab lists no endpoint, and Endpoints & Agents is still selected.
// Planted fault: removing the call of context.endpointsChanged after the save in src/settings-pages/endpoints.mjs leaves the
//                list empty, and the first assertion on the listed lines fails.
test("TST-290132: the endpoint just stored or cleared in place is listed or gone at once, in the selected tab", async () => {
  const page = await settingsPage({ handlers: [answering(CAMPUS)] });
  await openEndpointsTab(page);
  assert.deepEqual(linesOf(page), [], "precondition: no endpoint is listed");

  const result = await saveAndTest(page, CAMPUS);
  assert.match(result, /tiny-model is working/, "the form still shows its test result");
  assert.deepEqual(linesOf(page).map((line) => line.querySelector("h3").textContent), ["Endpoint: campus"],
    "failure node: the stored endpoint is listed at once, without a reload");
  assert.deepEqual(selectedTab(page), ["Endpoints & Agents"]);
  assert.equal(paneOf(page).hidden, false, "the tab's pane stays shown");

  await press(page.server, paneOf(page).querySelector(".endpoint-clear"));
  assert.equal(globalThis.localStorage.getItem(`${prefix}endpoint:campus`), null);
  assert.deepEqual(linesOf(page), [], "failure node: the endpoint cleared in the form is gone from the list at once");
  assert.deepEqual(selectedTab(page), ["Endpoints & Agents"]);
});

// TST-290133 · level: system · module: MOD-settings-pages
// guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: this browser keeps the endpoints campus and lab; Settings is open.
// input: the author selects Endpoints & Agents and presses Clear on the line of lab, which renders the page again; then leaves Settings and opens it anew.
// expect: after the Clear, Endpoints & Agents is still the selected tab and lists campus alone; Settings opened anew shows its first tab, General.
// Planted fault: selecting the first tab on every render in tabbedSettings (src/settings-pages/settings.mjs) makes the
//                assertion that Endpoints & Agents is still selected fail.
test("TST-290133: the page keeps the chosen tab across its own renders and opens anew on its first tab", async () => {
  const page = await settingsPage({ entries: { [`${prefix}endpoint:campus`]: record(CAMPUS), [`${prefix}endpoint:lab`]: record(LAB) } });
  assert.deepEqual(selectedTab(page), ["General"], "precondition: Settings opens on its first tab");
  await openEndpointsTab(page);
  await press(page.server, lineOf(page, "lab").querySelector("button.settings-endpoint-clear"));
  assert.deepEqual(selectedTab(page), ["Endpoints & Agents"], "failure node: the page's own render keeps the tab the author chose");
  assert.equal(paneOf(page).hidden, false);
  assert.deepEqual(linesOf(page).map((line) => line.querySelector("h3").textContent), ["Endpoint: campus"]);

  await page.dashboard.go("#uc");
  await page.dashboard.go("#settings");
  assert.deepEqual(selectedTab(page), ["General"], "Settings opened anew shows its first tab");
});

// Module (as the case stated it): MOD-settings-pages → MOD-browser-store → MOD-endpoint-calls
// TST-290134 · level: system · module: MOD-settings-pages
// guards: UC-042; UC-003; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: Settings is open in a browser that keeps no endpoint.
// input: the author stores and tests the endpoint campus through the form, which answers; then stores it again with a key the endpoint refuses.
// expect: after the first test, the browser keeps campus's last test as working, with its date, and campus's line says "Works. Last successful test: <that date>."; after the second, the last test is refused and the line says "Refused.".
// Planted fault: removing the recordTest call after testEndpoint in src/settings-pages/endpoints.mjs leaves no last test
//                stored, and the assertion on the stored last test fails.
test("TST-290134: the form's test is recorded as the endpoint's last test and shown on its line", async () => {
  let status = 200;
  const page = await settingsPage({ handlers: [async (url) => answering(CAMPUS, status)(url)] });
  await openEndpointsTab(page);

  await saveAndTest(page, CAMPUS);
  const working = stored("last-test:endpoint:campus");
  assert.equal(working?.outcome, "working", "failure node: the form's test is stored as the endpoint's last test");
  assert.match(working.at, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(lineOf(page, "campus").querySelector(".settings-endpoint-status").textContent,
    `Works. Last successful test: ${working.at}.`);

  status = 401;
  const refusal = await saveAndTest(page, { ...CAMPUS, key: "wrong-key" });
  assert.match(refusal, /Invalid API key\./);
  assert.equal(stored("last-test:endpoint:campus").outcome, "refused");
  assert.equal(lineOf(page, "campus").querySelector(".settings-endpoint-status").textContent, "Refused.");
});

// Module (as the case stated it): MOD-settings-pages → MOD-browser-store
// TST-290135 · level: system · module: MOD-settings-pages
// guards: UC-042; UC-003; CONFIGURATION LIVES IN THE BROWSER; EVERY SETTING IS REACHED FROM ONE PAGE
// given: Settings is open in a browser that keeps no endpoint; both endpoints answer their test requests.
// input: the author stores and tests the endpoint campus through the form, then presses Configure a model endpoint again and stores and tests the endpoint lab.
// expect: the browser keeps both endpoints, each under its own name, and the tab lists both, each line with Test, Change and Clear.
// Planted fault: making endpointKey ignore the name (src/settings-pages/endpoints.mjs) stores lab over campus, and the
//                assertion that both are kept fails.
test("TST-290135: a second endpoint with another name is kept beside the first, and both are listed", async () => {
  const page = await settingsPage({ handlers: [answering(CAMPUS), answering(LAB)] });
  await openEndpointsTab(page);
  await saveAndTest(page, CAMPUS);
  await saveAndTest(page, LAB);

  assert.equal(stored("endpoint:campus")?.model, CAMPUS.model, "failure node: the first endpoint is kept under its name");
  assert.equal(stored("endpoint:lab")?.model, LAB.model, "the second endpoint is kept under its own name");
  const lines = linesOf(page);
  assert.deepEqual(lines.map((line) => line.querySelector("h3").textContent), ["Endpoint: campus", "Endpoint: lab"]);
  for (const line of lines) {
    assert.deepEqual(["settings-endpoint-test", "settings-endpoint-change", "settings-endpoint-clear"]
      .map((control) => line.querySelectorAll(`button.${control}`).length), [1, 1, 1], "each line has Test, Change and Clear");
  }
});
