// While the GitHub token is unchanged, the notification checks of an open page do not read again a text they have read (ITM-862). The
// real app (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub fake, which lists every file a request
// reads: the batch request (POST /graphql) names the paths it reads, a single read is a `file <path>` request. The instance holds one
// SPEC change queue, whose index file a check reads for its entries (MOD-spec-changes' queues, through the snapshot's readMany of the
// host it is handed). The page opens with notifications switched off and the GitHub token stored. The person then switches them on
// (the stored time of the last check is set back six minutes) and the page's one check interval fires twice, a check each time, with
// the token unchanged between them; the test counts the requests that read the queue's index file.
// Run: node --test tests/site-frame-notifications-kept-memory.test.mjs
//
// Module: MOD-site-frame
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: component
//
// The expected results are written here from A PAGE LOAD READS THE REPOSITORY IN BATCHES ("a file whose blob the page has read
// already is not read again"); none is read from a document. The first check reads the queue's index file once; the second check, over
// the same blob with the same token, reads it no more, so the two checks together read it once.
// The callers read first (AGENTS.md 6a.1): tests/site-frame-notifications-cleared-token.test.mjs (TST-854001..3) opens the live page in
// this harness, installs the browser the notifications need and fires the page's check interval; tests/dashboard-notifications.test.mjs
// (specChangeFiles) builds the open queue entry the checks find. This file copies those patterns.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, settle, TOKEN } from "./app-harness.mjs";

const PREFIX = "agent-m:akmaier/agent-m:";
const API = "https://api.github.com";
const QUEUE = "docs/spec-freigaben/2026-10-18_sample";
const INDEX = `${QUEUE}/index.md`;
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
  [INDEX]: [
    "# SPEC approvals — queue 2026-10-18_sample · sample queue",
    "",
    "**Zieldatei aller Einträge:** `SPEC.md`",
    "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |",
    "|---|---|---|---|---|",
    "| 1 | `SPEC.md` | ## Sample section | — | — |",
    "",
  ].join("\n"),
  [`${QUEUE}/1-sample-entry.md`]: "## Sample section\nSample proposal text.\n",
};
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();
const emptyTags = (url) => (url.origin === API && /\/tags$/.test(url.pathname)
  ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : undefined);

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

// The requests so far that read `path`: the batch requests that name it, and the single reads of it.
const readsOf = (srv, path) => srv.batches.filter((named) => named.includes(path)).length + srv.requests.filter((what) => what === `file ${path}`).length;

// The fixture: the instance akmaier/agent-m with one use case and one open SPEC change queue, no product, the GitHub token stored,
// notifications not yet switched on, the page opened on a use case.
// -> srv; browser; tick(): switches notifications on, or keeps them due (the stored time of the last check is six minutes ago), fires
//    the page's check interval and waits for the page to settle -> the requests the check made.
async function livePage() {
  const srv = await repoServer({ files: FILES, handlers: [emptyTags] });
  const browser = installBrowser();
  const entries = { [`${PREFIX}github-token`]: JSON.stringify({ value: TOKEN, name: "GitHub token", expires: null, stored: "2026-10-18" }) };
  await openDashboard({ server: srv, hash: "#uc/UC-001", token: TOKEN, entries, caches: fakeCaches() });
  return {
    srv, browser,
    async tick() {
      globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
      const interval = browser.intervals.find((each) => each.ms === 60000);
      assert.ok(interval, "the frame started the checks of the page, which register their one interval");
      const from = srv.requests.length;
      interval.fn();
      await settle(srv);
      return srv.requests.slice(from);
    },
  };
}

// TST-862001
// level: component
// module: MOD-site-frame
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the live page, the GitHub token stored and not changed, an open SPEC change queue in the instance, notifications switched on and due
// input: the page's check interval fires; five minutes pass (the stored time of the last check is set back); it fires again
// expect: the first check reads the queue's index file once (the positive the second is measured against); the second check makes requests of its own and reads that file no more, so the two checks together read it once
test("TST-862001 · over two checks with the same token, the text of a file the first read is not read again in the second", async (t) => {
  const { srv, browser, tick } = await livePage();
  try {
    const beforeChecks = readsOf(srv, INDEX);
    const first = await tick();
    const afterFirst = readsOf(srv, INDEX);
    const second = await tick();
    const afterSecond = readsOf(srv, INDEX);
    t.diagnostic(`reads of ${INDEX}: before the checks ${beforeChecks}, after the first check ${afterFirst}, after the second ${afterSecond}; requests of the first check ${first.length}, of the second ${second.length}`);
    assert.equal(afterFirst - beforeChecks, 1, "known positive: the first check read the queue's index file, once");
    assert.ok(second.length > 0, "the second check made requests of its own");
    assert.equal(afterSecond - beforeChecks, 1, "the two checks together read the queue's index file once: the second read it no more");
  } finally { browser.restore(); }
});
