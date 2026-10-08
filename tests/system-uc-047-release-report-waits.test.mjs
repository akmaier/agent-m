// UC-047 steps 2–4 for a completed release candidate (ITM-271), through the real dashboard and its public harness.
// Run: node --test tests/system-uc-047-release-report-waits.test.mjs
//
// Module: MOD-notifications · MOD-progress-measures · MOD-release-evidence
// Guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// Level: system

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, settle, REPO } from "./app-harness.mjs";

const PREFIX = `agent-m:${REPO}:`;
const API = "https://api.github.com";
const VERSION = "2026.10.8", CANDIDATE = `v${VERSION}-rc.1`;
const JOB = "docs/jobs/JOB-20261008-0148-dc62.md";
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();

function runRecord(state = null) {
  const end = state ? ["## End", "", "at: 2026-10-08 02:00 UTC", `state: ${state}`, ""] : [];
  return ["---", "id: JOB-20261008-0148-dc62", "kind: run-tests", "works_on:", `  - ${"a".repeat(40)}`,
    "route: ci hosted", "started_by: akmaier", "start: 2026-10-08 01:48 UTC", "agent_m: unreleased, commit unknown", "limit: 1", "---",
    "## Destinations", "", "## Parameters", "", "```json",
    JSON.stringify({ candidate: { version: VERSION, tag: CANDIDATE, commit: "a".repeat(40) } }), "```", "", ...end].join("\n");
}

function browser() {
  const prior = { Notification: Object.getOwnPropertyDescriptor(globalThis, "Notification"), navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"), setInterval: globalThis.setInterval };
  let tick = null;
  Object.defineProperty(globalThis, "Notification", { value: { permission: "granted" }, configurable: true });
  Object.defineProperty(globalThis, "navigator", { value: { serviceWorker: { register: async () => null, getRegistration: async () => null } }, configurable: true });
  globalThis.setInterval = (fn) => { tick = fn; return 1; };
  return { tick: () => tick(), restore() {
    if (prior.Notification) Object.defineProperty(globalThis, "Notification", prior.Notification); else delete globalThis.Notification;
    if (prior.navigator) Object.defineProperty(globalThis, "navigator", prior.navigator); else delete globalThis.navigator;
    globalThis.setInterval = prior.setInterval;
  } };
}

function notifications() {
  Object.defineProperty(globalThis.document, "baseURI", { value: "https://akmaier.github.io/agent-m/", configurable: true });
  const shown = [];
  const registration = { showNotification: (title, options) => shown.push({ title, ...options }) };
  Object.defineProperty(globalThis.navigator.serviceWorker, "register", { value: async () => registration, configurable: true });
  Object.defineProperty(globalThis.navigator.serviceWorker, "getRegistration", { value: async () => registration, configurable: true });
  return shown;
}

// TST-293001
// Module: MOD-notifications · MOD-progress-measures · MOD-release-evidence
// Guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// Level: system
// Precondition: notifications are on; the instance has a v<version>-rc.N tag and its run-tests job has no End record.
// Input: an unchanged due check runs before End; the run then ends done and remains unchanged; its report and release tag
//        are then present.
// Expected: no notice precedes End; exactly one release-v<version> notice names the repository and release route; no
//           repeat follows while it waits, and no notice follows acceptance.
test("TST-293001: UC-047 derives a release report only after its candidate run ends", async () => {
  const tags = [{ name: CANDIDATE, commit: "a".repeat(40) }];
  const server = await repoServer({ files: { [JOB]: runRecord() }, handlers: [(url) => {
    if (url.origin === API && /\/tags$/.test(url.pathname)) return new Response(JSON.stringify(tags), { headers: { "Content-Type": "application/json" } });
    return undefined;
  }] });
  const pageBrowser = browser();
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = notifications();
    await settle(server);
    assert.deepEqual(shown, [], "the unfinished run is only the baseline, and tells nothing");

    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    pageBrowser.tick(); await settle(server);
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`))[REPO], {},
      "a due unfinished check derives no report into the browser's notified state");

    await server.change(JOB, runRecord("done"));
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    pageBrowser.tick();
    await settle(server);
    assert.equal(shown.length, 1, "the completed candidate report is notified once");
    assert.equal(shown[0].title, `release-v${VERSION} waits for your acceptance`);
    assert.equal(shown[0].body, REPO, "the notice names its repository");
    assert.equal(shown[0].data.url, new URL("?#release", "https://akmaier.github.io/agent-m/").href, "the notice carries the release panel route");

    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    pageBrowser.tick(); await settle(server);
    assert.equal(shown.length, 1, "the unchanged waiting report is not notified again");

    tags.push({ name: `v${VERSION}`, commit: "a".repeat(40) });
    await server.change(`docs/tests/releases/v${VERSION}.md`, "accepted release report\n");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    pageBrowser.tick(); await settle(server);
    assert.equal(shown.length, 1, "the accepted report and release tag leave nothing to notify");
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`))[REPO], {},
      "the accepted public repository state removes the report from what waits, rather than merely deduplicating it");
  } finally { pageBrowser.restore(); }
});
