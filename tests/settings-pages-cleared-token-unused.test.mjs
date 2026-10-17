// After Clear everything on the live Settings page, the next request the open page sends carries no token (ITM-825). The real
// app (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub fake; a handler of the test records the
// authorisation header of every request without answering it. The person reads a use case with the stored token, opens
// Settings, ticks the confirmation and presses Clear everything in this browser, and then makes the next page actions without a
// reload: opens the Repositories tab of Settings (which reads the instance's switch of recording conversations through the
// instance host the page connected when Settings was drawn), and then opens another page of the app.
// Run: node --test tests/settings-pages-cleared-token-unused.test.mjs
//
// Module: MOD-settings-pages
// Guards: A CLEAR IS A REAL CLEAR
// Level: component
//
// The expected results are written here from A CLEAR IS A REAL CLEAR ("Clearing the configuration removes the stored
// credentials from the browser, not only from the displayed form") and from A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT (a
// token leaves the browser only as the authorisation header of requests to its server); none is read from a document. A token
// that was cleared is no stored credential: no request sent after the clear carries its value in any header.
// The callers read first (AGENTS.md 6a.1): tests/settings-pages-clear-everything-live.test.mjs (TST-819001) opens the live
// Settings page in this harness and presses Clear everything; this file copies its pattern, adds the recording handler and the
// two page actions after the press.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const PREFIX = "agent-m:akmaier/agent-m:";
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };
const entriesOf = () => [...Array(globalThis.localStorage.length).keys()].map((index) => globalThis.localStorage.key(index)).filter((key) => key.startsWith(PREFIX));

// The live page that has read a use case with the token, then Settings drawn; `token`: the GitHub token stored, or null.
// -> the server, the requests' record (every request with whether its headers carry the token), and the Settings page's nodes.
async function settingsOpen({ token }) {
  const sent = [];
  const spy = (url, init) => { sent.push({ what: `${init.method} ${url.origin}${url.pathname}`, token: JSON.stringify(init.headers ?? {}).includes(TOKEN) }); return undefined; };
  const srv = await repoServer({ files: FILES, handlers: [spy] });
  const entries = {
    ...(token ? { [`${PREFIX}github-token`]: JSON.stringify({ value: token, name: "GitHub token", expires: null, stored: "2026-10-17" }) } : {}),
    [`${PREFIX}products`]: JSON.stringify(["https://github.com/someone/product"]),
  };
  const page = await openDashboard({ server: srv, hash: "#uc/UC-001", token, entries, caches: fakeCaches() });
  const dom = richDocument(), createElement = globalThis.document.createElement.bind(globalThis.document), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  globalThis.document.createElement = (name) => {
    const node = createElement(name);
    if (!("childNodes" in node)) Object.defineProperty(node, "childNodes", { get: () => node.children ?? [] });
    return node;
  };
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  globalThis.confirm = () => true;
  await page.go("#settings");
  const general = mounted.find((node) => node.className === "settings-tab-panel" && node.textContent.includes("General"));
  return { srv, sent, page, general, nodes: () => ({ children: mounted }) };
}

for (const [name, token] of [["with a token", TOKEN], ["without a token", null]]) {
  // TST-825001
  // level: component
  // module: MOD-settings-pages
  // guards: A CLEAR IS A REAL CLEAR
  // given: the live page that has read a use case and drawn Settings, with Agent M's settings in localStorage
  // input: tick the confirmation, press Clear everything in this browser, then open the Repositories tab of Settings, then open the use case page again
  // expect: no request sent after the press carries the token in a header, on the press, on the Repositories tab and on the next page
  test(`TST-825001 · after Clear everything ${name}, the next requests of the open page carry no token`, async (t) => {
    const { srv, sent, page, general, nodes } = await settingsOpen({ token });
    assert.ok(general, "Settings is drawn");
    if (token) assert.ok(sent.some((request) => request.token), "the page sent the token before the clear");
    const clear = controls(general, "settings-clear-everything")[0], acknowledgement = controls(general, "settings-clear-ack")[0];
    acknowledgement.checked = true; acknowledgement.fire("change", {});

    const pressFrom = sent.length, pressRequests = (await press(srv, clear)).length;
    assert.deepEqual(entriesOf(), [], "Clear everything removed every entry of Agent M");
    const pressSent = sent.slice(pressFrom);

    const tab = controls(nodes(), "settings-tab").find((node) => node.textContent === "Repositories");
    assert.ok(tab, "the page offers the Repositories tab");
    const tabFrom = sent.length, tabRequests = (await press(srv, tab)).length;
    await settle(srv);
    const tabSent = sent.slice(tabFrom);

    const pageFrom = sent.length, pageRequests = (await page.go("#uc/UC-001")).length;
    const pageSent = sent.slice(pageFrom);

    t.diagnostic(`${name}: requests on the press ${pressRequests}, on the Repositories tab ${tabRequests}, on the next page ${pageRequests}; carrying the token: ${pressSent.filter((r) => r.token).length}, ${tabSent.filter((r) => r.token).length}, ${pageSent.filter((r) => r.token).length}`);
    assert.equal(pressSent.some((request) => request.token), false, "no request of the press carries the token");
    assert.deepEqual(tabSent.filter((request) => request.token).map((request) => request.what), [], "no request of the Repositories tab carries the cleared token");
    assert.deepEqual(pageSent.filter((request) => request.token).map((request) => request.what), [], "no request of the next page carries the cleared token");
  });
}

// TST-825002
// level: component
// module: MOD-settings-pages
// guards: A CLEAR IS A REAL CLEAR
// given: the live page that has read a use case and drawn Settings, with the instance's GitHub token stored
// input: press Clear on the line of the GitHub token and confirm it, then open the Repositories tab of Settings
// expect: the token is gone from localStorage, and no request sent after the press carries its value in a header
test("TST-825002 · after Clear of the GitHub token, the next request of the open page carries no token", async (t) => {
  const { srv, sent, general, nodes } = await settingsOpen({ token: TOKEN });
  assert.ok(general, "Settings is drawn");
  const line = controls(nodes(), "settings-repository").find((node) => node.textContent.startsWith("GitHub token"));
  assert.ok(line, "the page shows the line of the GitHub token");
  const clear = controls(line, "settings-repository-clear")[0];
  assert.ok(clear, "the line offers Clear");
  await press(srv, clear);
  assert.equal(entriesOf().some((key) => key === `${PREFIX}github-token`), false, "the token is removed from localStorage");
  const tab = controls(nodes(), "settings-tab").find((node) => node.textContent === "Repositories");
  const from = sent.length, requests = (await press(srv, tab)).length;
  await settle(srv);
  const afterClear = sent.slice(from);
  t.diagnostic(`requests on the Repositories tab ${requests}, carrying the token: ${afterClear.filter((r) => r.token).length}`);
  assert.deepEqual(afterClear.filter((request) => request.token).map((request) => request.what), [], "no request of the Repositories tab carries the cleared token");
});
