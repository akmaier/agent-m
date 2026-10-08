// Release guard for UC-047's release-test-report notification (ITM-271), driven through the real dashboard caller.
// Run: node --test tests/release-uc-047-release-report-waits.test.mjs
//
// Module: MOD-notifications · MOD-progress-measures · MOD-release-evidence
// Guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// Level: release

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, settle, REPO } from "./app-harness.mjs";

const PREFIX = `agent-m:${REPO}:`, API = "https://api.github.com";
const VERSION = "2026.10.8", CANDIDATE = `v${VERSION}-rc.1`, JOB = "docs/jobs/JOB-20261008-0148-dc62.md";
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();
const record = (end = "") => ["---", "id: JOB-20261008-0148-dc62", "kind: run-tests", "works_on:", `  - ${"a".repeat(40)}`,
  "route: ci hosted", "started_by: akmaier", "start: 2026-10-08 01:48 UTC", "agent_m: unreleased, commit unknown", "limit: 1", "---",
  "## Destinations", "", "## Parameters", "", "```json", JSON.stringify({ candidate: { version: VERSION, tag: CANDIDATE, commit: "a".repeat(40) } }), "```", "", end].join("\n");

function installBrowser() {
  const old = { Notification: Object.getOwnPropertyDescriptor(globalThis, "Notification"), navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"), setInterval: globalThis.setInterval };
  let next = null;
  Object.defineProperty(globalThis, "Notification", { value: { permission: "granted" }, configurable: true });
  Object.defineProperty(globalThis, "navigator", { value: { serviceWorker: { register: async () => null, getRegistration: async () => null } }, configurable: true });
  globalThis.setInterval = (fn) => { next = fn; return 1; };
  return { tick: () => next(), restore() {
    if (old.Notification) Object.defineProperty(globalThis, "Notification", old.Notification); else delete globalThis.Notification;
    if (old.navigator) Object.defineProperty(globalThis, "navigator", old.navigator); else delete globalThis.navigator;
    globalThis.setInterval = old.setInterval;
  } };
}
function capture() {
  Object.defineProperty(globalThis.document, "baseURI", { value: "https://akmaier.github.io/agent-m/", configurable: true });
  const shown = [], worker = { showNotification: (title, options) => shown.push({ title, ...options }) };
  Object.defineProperty(globalThis.navigator.serviceWorker, "register", { value: async () => worker, configurable: true });
  Object.defineProperty(globalThis.navigator.serviceWorker, "getRegistration", { value: async () => worker, configurable: true });
  return shown;
}

// TST-293002
// Module: MOD-notifications · MOD-progress-measures · MOD-release-evidence
// Guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// Level: release
// Precondition: this browser has notifications on and records an unfinished tagged release candidate as its baseline.
// Input: an unchanged due check runs before End; its public run-tests record ends done, is checked again unchanged, then
//        receives its release report and tag.
// Expected: the release report appears once at release-v<version>, identifies this repository, opens #release, and stops
//           appearing both while unchanged and after acceptance.
test("TST-293002: release notification names and routes exactly one completed report", async () => {
  const tags = [{ name: CANDIDATE, commit: "a".repeat(40) }];
  const server = await repoServer({ files: { [JOB]: record() }, handlers: [(url) => url.origin === API && /\/tags$/.test(url.pathname)
    ? new Response(JSON.stringify(tags), { headers: { "Content-Type": "application/json" } }) : undefined] });
  const b = installBrowser();
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = capture(); await settle(server);
    assert.equal(shown.length, 0, "the run has not ended, so no report is announced");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) })); b.tick(); await settle(server);
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`))[REPO], {},
      "the due unfinished check leaves no release report in the browser's public notified record");
    await server.change(JOB, record("## End\n\nat: 2026-10-08 02:00 UTC\nstate: done\n"));
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) })); b.tick(); await settle(server);
    assert.deepEqual(shown.map(({ title, body, data }) => ({ title, body, url: data.url })), [{
      title: `release-v${VERSION} waits for your acceptance`, body: REPO,
      url: new URL("?#release", "https://akmaier.github.io/agent-m/").href,
    }], "the completed report is the one notification and points at its acceptance panel");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) })); b.tick(); await settle(server);
    assert.equal(shown.length, 1, "the same report still waiting is not repeated");
    tags.push({ name: `v${VERSION}`, commit: "a".repeat(40) }); await server.change(`docs/tests/releases/v${VERSION}.md`, "accepted\n");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) })); b.tick(); await settle(server);
    assert.equal(shown.length, 1, "an accepted report with its release tag no longer waits");
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`))[REPO], {},
      "acceptance removes the waiting report rather than leaving a deduplicated copy in browser state");
  } finally { b.restore(); }
});
