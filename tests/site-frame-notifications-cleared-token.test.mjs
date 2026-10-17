// After the GitHub token is cleared on the live Settings page, the next check of the notifications sends no request that carries it
// (ITM-854). The real app (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub fake; a handler of the
// test records the authorisation header of every request without answering it. The person has switched notifications on, so the
// frame has started the checks of what waits for acceptance on the open page with the instance as it connected it. The person
// opens Settings and presses Clear on the line of the GitHub token, without a reload. A check then falls due again (five minutes
// pass: the stored time of the last check is set back) and the page's one check interval fires.
// Run: node --test tests/site-frame-notifications-cleared-token.test.mjs
//
// Module: MOD-site-frame
// Guards: A CLEAR IS A REAL CLEAR
// Level: component
//
// The expected results are written here from A CLEAR IS A REAL CLEAR ("Clearing the configuration removes the stored
// credentials from the browser, not only from the displayed form"); none is read from a document. A token that was cleared is
// no stored credential: no request sent after the clear carries its value in any header, whoever sends it, the notification
// checks included.
// The callers read first (AGENTS.md 6a.1): tests/settings-pages-cleared-token-unused.test.mjs (TST-825002) opens the live Settings
// page in this harness and presses Clear on the token line; tests/dashboard-notifications-wiring.test.mjs installs the browser
// (Notification, a worker registration, a captured setInterval) that the notifications need. This file copies both patterns.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const PREFIX = "agent-m:akmaier/agent-m:";
const API = "https://api.github.com";
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();
const emptyTags = (url) => (url.origin === API && /\/tags$/.test(url.pathname)
  ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : undefined);
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };

// Notification "granted", and a setInterval that only records its calls, so the test fires the page's check itself.
function installBrowser() {
  const prior = {
    hadNotification: "Notification" in globalThis, Notification: globalThis.Notification,
    hadNavigator: "navigator" in globalThis, navigator: globalThis.navigator,
    setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval, confirm: globalThis.confirm,
  };
  const intervals = [];
  const registration = { showNotification() {} };
  Object.defineProperty(globalThis, "Notification", { value: { permission: "granted", requestPermission: async () => "granted" }, configurable: true, writable: true });
  Object.defineProperty(globalThis, "navigator", {
    value: { serviceWorker: { register: async () => registration, getRegistration: async () => registration }, userAgent: "node" },
    configurable: true, writable: true,
  });
  globalThis.setInterval = (fn, ms) => { intervals.push({ fn, ms }); return 1; };
  globalThis.clearInterval = () => {};
  globalThis.confirm = () => true;
  return {
    intervals,
    restore() {
      if (prior.hadNotification) globalThis.Notification = prior.Notification; else delete globalThis.Notification;
      if (prior.hadNavigator) globalThis.navigator = prior.navigator; else delete globalThis.navigator;
      globalThis.setInterval = prior.setInterval;
      globalThis.clearInterval = prior.clearInterval;
      globalThis.confirm = prior.confirm;
    },
  };
}

// The fixture: the instance akmaier/agent-m with one use case, no product, notifications switched on with the last check six
// minutes old, the page opened on a use case and then Settings drawn; `token`: the GitHub token stored, or null.
// -> sent: the record of every request (what it is, whether its headers carry the token); tick(): makes a check due again and
//    fires the page's check interval, -> the requests since; clearToken(): presses Clear on the token's line.
async function livePage({ token }) {
  const sent = [];
  const spy = (url, init) => { sent.push({ what: `${init.method} ${url.origin}${url.pathname}`, token: JSON.stringify(init.headers ?? {}).includes(TOKEN) }); return undefined; };
  const srv = await repoServer({ files: FILES, handlers: [emptyTags, spy] });
  const browser = installBrowser();
  const entries = {
    ...(token ? { [`${PREFIX}github-token`]: JSON.stringify({ value: token, name: "GitHub token", expires: null, stored: "2026-10-17" }) } : {}),
    [`${PREFIX}notifications`]: JSON.stringify({ checked: minutesAgo(6) }),
  };
  const page = await openDashboard({ server: srv, hash: "#uc/UC-001", token, entries, caches: fakeCaches() });
  const loadChecks = sent.length;
  const dom = richDocument(), createElement = globalThis.document.createElement.bind(globalThis.document), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  globalThis.document.createElement = (name) => {
    const node = createElement(name);
    if (!("childNodes" in node)) Object.defineProperty(node, "childNodes", { get: () => node.children ?? [] });
    return node;
  };
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  await page.go("#settings");
  return {
    srv, sent, browser, loadChecks,
    async clearToken() {
      const line = controls({ children: mounted }, "settings-repository").find((node) => node.textContent.startsWith("GitHub token"));
      assert.ok(line, "the page shows the line of the GitHub token");
      const clear = controls(line, "settings-repository-clear")[0];
      assert.ok(clear, "the line offers Clear");
      await press(srv, clear);
      assert.equal(globalThis.localStorage.getItem(`${PREFIX}github-token`), null, "the token is removed from localStorage");
    },
    async tick() {
      globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
      const interval = browser.intervals.find((each) => each.ms === 60000);
      assert.ok(interval, "the frame started the checks of the page, which register their one interval");
      const from = sent.length;
      interval.fn();
      await settle(srv);
      return sent.slice(from);
    },
  };
}

// TST-854001
// level: component
// module: MOD-site-frame
// guards: A CLEAR IS A REAL CLEAR
// given: the live page, the GitHub token stored, notifications switched on and due, Settings drawn; the check at the page's start has run with the token
// input: press Clear on the line of the GitHub token and confirm it; five minutes pass; the page's check interval fires
// expect: the check at the start sent requests with the token (the positive the test is measured against); the check after the clear sends at least one request, and none of them carries the token in a header
test("TST-854001 · after Clear of the GitHub token, the next notification check sends no request that carries it", async (t) => {
  const { sent, browser, loadChecks, clearToken, tick } = await livePage({ token: TOKEN });
  try {
    assert.ok(sent.slice(0, loadChecks).some((request) => request.token), "known positive: the page sent the token before the clear, the start's check included");
    const before = (await tick()).filter((request) => request.what.startsWith("GET " + API) || request.what.startsWith("POST " + API));
    assert.ok(before.some((request) => request.token), "known positive: a check with the token stored carries it");
    await clearToken();
    const after = await tick();
    t.diagnostic(`check with the token: ${before.length} requests, ${before.filter((r) => r.token).length} carrying it; check after the clear: ${after.length} requests, ${after.filter((r) => r.token).length} carrying it`);
    assert.ok(after.length > 0, "the check after the clear made requests");
    assert.deepEqual(after.filter((request) => request.token).map((request) => request.what), [], "no request of the check after the clear carries the cleared token");
  } finally { browser.restore(); }
});

// TST-854002
// level: component
// module: MOD-site-frame
// guards: A CLEAR IS A REAL CLEAR
// given: the live page of a browser that never stored a token, notifications switched on and due, Settings drawn
// input: five minutes pass; the page's check interval fires
// expect: the check makes at least one request and none carries the token; its requests are the count a check after a clear is read against
test("TST-854002 · a notification check of a page that never had a token makes requests that carry none", async (t) => {
  const { sent, browser, tick } = await livePage({ token: null });
  try {
    const check = await tick();
    t.diagnostic(`check without a token: ${check.length} requests, ${check.filter((r) => r.token).length} carrying one`);
    assert.ok(check.length > 0, "the check made requests");
    assert.equal(sent.some((request) => request.token), false, "no request of the page carries a token");
  } finally { browser.restore(); }
});
