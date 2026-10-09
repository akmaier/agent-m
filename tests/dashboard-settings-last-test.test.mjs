// UC-042 step 1 — each browser setting's line shows ✓ works with the date of the last successful test, or ✗ refused when the server
// refused it at the last use, also after a reload (ITM-136). The real app (docs/assets/dashboard-app.mjs) runs in
// tests/app-harness.mjs; a reload is a new page load — the app imported afresh, with nothing in memory — on the same browser
// storage. The kept date and outcome are browser settings like the rest: shown on the settings page, removed by Clear and by Clear
// everything, carried by an export. Run: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; EVERY SETTING IS REACHED FROM ONE PAGE; A CLEAR IS A REAL CLEAR; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; UC-042
// Level: component
//
// The counter-proof of every test here (a planted fault and its red result): docs/measurements/2026-10-01_settings-last-test.md.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, TOKEN, richDocument, press, settle, attrOf } from "./app-harness.mjs";
import { exportSettings } from "../docs/assets/settings-store.mjs";
import { GL, GL_ADDR, GL_TOKEN } from "./review-core.d/helpers.mjs";

const API = "https://api.github.com";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
const day = (days) => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()) + days * 864e5).toISOString().slice(0, 10); };
const TODAY = day(0);

// What the person answers to a confirmation.
globalThis.confirm = () => true;

// Agent M's entries of this browser's localStorage, { key: value }.
const agentEntries = () => {
  const out = {};
  for (let i = 0; i < globalThis.localStorage.length; i++) {
    const k = globalThis.localStorage.key(i);
    if (k && k.startsWith("agent-m.")) out[k] = globalThis.localStorage.getItem(k);
  }
  return out;
};

// The instance's repository on GitHub. While `world.refuseGitHub` is set, GitHub's API refuses every request that carries the
// stored token with 401, as it does a token that expired or was regenerated; a GitLab server answers its project's API — Test's
// request with the project token — with 401 while `world.refuseGitLab` is set; and localhost answers on the session ports in
// `world.up`.
async function instanceWorld() {
  const world = { refuseGitHub: false, refuseGitLab: false, up: new Set() };
  world.srv = await repoServer({ files: { "SPEC.md": "# S\n", "docs/use-cases/README.md": "# Use cases\n" }, handlers: [
    (url, init) => (world.refuseGitHub && url.origin === API && init.headers?.Authorization === `Bearer ${TOKEN}`
      ? json({ message: "Bad credentials" }, 401) : undefined),
    (url) => {
      if (url.origin !== GL || !url.pathname.startsWith("/api/v4/projects/")) return undefined;
      return world.refuseGitLab ? json({ message: "401 Unauthorized" }, 401)
        : json({ path_with_namespace: "grp/sub/proj", visibility: "private", default_branch: "main",
          permissions: { project_access: { access_level: 40 } } });
    },
    (url) => {
      if (url.hostname !== "localhost") return undefined;
      if (world.up.has(Number(url.port))) return new Response("", { status: 200 });
      throw new TypeError("Failed to fetch");
    },
  ] });
  return world;
}

// One page load of the settings page on a browser that holds `entries` (a reload keeps every entry of the page before it).
async function settingsPage(world, entries = { "agent-m.github-token": TOKEN }) {
  const page = await openDashboard({ server: world.srv, hash: "#uc", token: null });
  for (const [k, v] of Object.entries(entries)) globalThis.localStorage.setItem(k, v);
  const dom = richDocument();
  await page.go("#settings");
  const box = () => dom.byId("browser-settings");
  return { page, dom, box };
}
const reload = (world) => settingsPage(world, agentEntries());

// The line of one setting, by its row's name; the text of its state.
const row = (box, name) => box().innerHTML.split('<div class="setting"').find((r) => r.startsWith(` data-setting-row="${name}"`)) ?? "";
const stateOf = (html) => /<p class="state">([^]*?)<\/p>/.exec(html)?.[1] ?? null;
const gitlabLine = (box) => /<div class="gitlab-token">[^]*?<\/div>/.exec(box().innerHTML)?.[0] ?? "";
const sessionLine = (box) => /<div class="remote-session">[^]*?<\/div>/.exec(box().innerHTML)?.[0] ?? "";
// A control of the page found as the view finds it: by the selector the view asks for, or among those of one attribute by value.
const inBox = (box, sel) => box().querySelector(sel);
const among = (box, attr, value) => box().querySelectorAll(`[${attr}]`).find((c) => attrOf(c.tag, attr) === value) ?? null;

// ---------------------------------------------------------------- the GitHub token

test("UC-042 step 1: a successful Test of the GitHub token is shown after a reload — ✓ works with the date of that test", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world);
  assert.equal(stateOf(row(box, "github-token")), "stored — not tested on this page yet", "before any test");
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  assert.equal(stateOf(row(box, "github-token")), `✓ works — tested ${TODAY}`);
  const again = await reload(world);
  assert.equal(stateOf(row(again.box, "github-token")), `✓ works — tested ${TODAY}`, "after the reload");
});

// A token GitHub refuses stays refused: the reload's own requests with it are refused again. Expected: its line and the line at
// the top name it refused after the reload as before it.
test("UC-042 step 1 · 1b: a token GitHub refused at its last use is shown refused after a reload — on its line and at the top", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world);
  world.refuseGitHub = true;
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  assert.equal(stateOf(row(box, "github-token")), "✗ refused — GitHub did not accept it at the last use");
  const again = await reload(world);
  assert.equal(stateOf(row(again.box, "github-token")), "✗ refused — GitHub did not accept it at the last use", "after the reload");
  const banner = again.page.el("token-banner");
  assert.ok(banner.includes("<strong>GitHub refused your GitHub token — it has expired, or was regenerated or deleted on GitHub.</strong>"));
  assert.ok(banner.includes('href="https://github.com/settings/personal-access-tokens"'), "with Renew");
  await again.page.go("#uc");
  assert.ok(again.page.el("token-banner").includes("GitHub refused your GitHub token"), "on every page");
});

test("UC-042 step 1: a successful Test after a refusal replaces it — the line works again, and so does the next page load", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world);
  world.refuseGitHub = true;
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  world.refuseGitHub = false;
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  const again = await reload(world);
  assert.equal(stateOf(row(again.box, "github-token")), `✓ works — tested ${TODAY}`);
  assert.equal(again.page.el("token-banner"), "", "no refusal at the top");
});

test("UC-042 step 2: a new token stored with Change starts untested — the last test of the old token does not stick to it", async () => {
  const world = await instanceWorld();
  const { box, dom } = await settingsPage(world);
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  await press(world.srv, inBox(box, '[data-change="agent-m.github-token"]'));
  dom.byId("ack").checked = true;
  dom.byId("ack").fire("change", {});
  await settle(world.srv);
  dom.byId("token-input").value = "github_pat_RENEWED0123456789abcdefghij";
  await press(world.srv, dom.byId("token-save"));
  assert.equal(stateOf(row(box, "github-token")), "stored — not tested on this page yet");
  const again = await reload(world);
  assert.equal(stateOf(row(again.box, "github-token")), "stored — not tested on this page yet", "after the reload too");
});

// ---------------------------------------------------------------- A CLEAR IS A REAL CLEAR · EVERY SETTING IS REACHED FROM ONE PAGE

test("UC-042 step 2 · A CLEAR IS A REAL CLEAR: Clear removes the kept date and outcome with the token from localStorage", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world);
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  assert.ok(Object.values(agentEntries()).some((v) => v.includes(TODAY)), "the date of the test is kept in this browser");
  await press(world.srv, inBox(box, '[data-clear="agent-m.github-token"]'));
  assert.deepEqual(agentEntries(), {}, "nothing of the token is left — its last test neither");
  const again = await settingsPage(world, { "agent-m.github-token": TOKEN });
  assert.equal(stateOf(row(again.box, "github-token")), "stored — not tested on this page yet", "the same token stored again starts untested");
});

test("UC-042 step 6 · A CLEAR IS A REAL CLEAR: Clear everything removes every kept test result", async () => {
  const world = await instanceWorld();
  const { box, dom } = await settingsPage(world, { "agent-m.github-token": TOKEN, "agent-m.products": JSON.stringify([GL_ADDR]),
    "agent-m.gitlab-tokens": JSON.stringify({ [GL_ADDR]: { token: GL_TOKEN, expires: day(60) } }) });
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  await press(world.srv, among(box, "data-test-gitlab", GL_ADDR));
  await press(world.srv, dom.byId("token-clear"));
  assert.deepEqual(agentEntries(), {});
});

test("EVERY SETTING IS REACHED FROM ONE PAGE: after the tests, every entry Agent M keeps in localStorage has its place on the settings page", async () => {
  const world = await instanceWorld();
  world.up.add(20001);
  const { box } = await settingsPage(world, { "agent-m.github-token": TOKEN, "agent-m.products": JSON.stringify([GL_ADDR]),
    "agent-m.gitlab-tokens": JSON.stringify({ [GL_ADDR]: { token: GL_TOKEN, expires: day(60) } }),
    "agent-m.jump-host": JSON.stringify({ host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20003, reverseKey: "", forwardKey: "" }),
    "agent-m.remote-sessions": JSON.stringify([{ name: "lab-pc", port: 20001, bridgePort: 8765, token: "bridgeTOKEN-0123456789abcdef" }]) });
  await press(world.srv, inBox(box, '[data-test="agent-m.github-token"]'));
  await press(world.srv, among(box, "data-test-gitlab", GL_ADDR));
  await press(world.srv, among(box, "data-test-session", "lab-pc"));
  const again = await reload(world);
  const html = again.box().innerHTML;
  for (const k of Object.keys(agentEntries())) assert.ok(html.includes(`data-setting-key="${k}"`), `${k} has its place on the page`);
});

// ---------------------------------------------------------------- a GitLab project token

test("UC-042 step 1: a GitLab project token's last test — works, then refused — is shown after a reload", async () => {
  const world = await instanceWorld();
  const entries = { "agent-m.github-token": TOKEN, "agent-m.products": JSON.stringify([GL_ADDR]),
    "agent-m.gitlab-tokens": JSON.stringify({ [GL_ADDR]: { token: GL_TOKEN, expires: day(60) } }) };
  const { box } = await settingsPage(world, entries);
  assert.match(gitlabLine(box), /<span class="state">stored — not tested on this page yet<\/span>/);
  await press(world.srv, among(box, "data-test-gitlab", GL_ADDR));
  let again = await reload(world);
  assert.match(gitlabLine(again.box), new RegExp(`<span class="state">✓ works — tested ${TODAY}</span>`), "works, after the reload");
  world.refuseGitLab = true;
  await press(world.srv, among(again.box, "data-test-gitlab", GL_ADDR));
  again = await reload(world);
  assert.match(gitlabLine(again.box), /<span class="state">✗ refused — gitlab\.example\.org did not accept it at the last use<\/span>/,
    "refused, after the reload");
});

test("UC-042 step 2: a GitLab project token changed or cleared takes its last test with it", async () => {
  const world = await instanceWorld();
  const entries = { "agent-m.github-token": TOKEN, "agent-m.products": JSON.stringify([GL_ADDR]),
    "agent-m.gitlab-tokens": JSON.stringify({ [GL_ADDR]: { token: GL_TOKEN, expires: day(60) } }) };
  const { box, dom } = await settingsPage(world, entries);
  await press(world.srv, among(box, "data-test-gitlab", GL_ADDR));
  dom.byId("ack").checked = true;
  await press(world.srv, among(box, "data-change-gitlab", GL_ADDR));
  const form = among(box, "data-change-form", GL_ADDR);
  form.querySelector("[data-gl-token]").value = "glpat-renewedTOKENvalue0123456789";
  form.querySelector("[data-gl-expires]").value = day(80);
  await press(world.srv, form.querySelector("[data-gl-store]"));
  let again = await reload(world);
  assert.match(gitlabLine(again.box), /<span class="state">stored — not tested on this page yet<\/span>/, "the new value starts untested");
  await press(world.srv, among(again.box, "data-test-gitlab", GL_ADDR));
  await press(world.srv, among(again.box, "data-clear-gitlab", GL_ADDR));
  assert.ok(!Object.values(agentEntries()).some((v) => v.includes(TODAY)), "no date of a test is left");
  again = await reload(world);
  assert.equal(gitlabLine(again.box), "", "no line for a cleared token");
});

// ---------------------------------------------------------------- a remote session

test("UC-042 step 1: a remote session's last test — something answered, or nothing — is shown after a reload", async () => {
  const world = await instanceWorld();
  const entries = { "agent-m.github-token": TOKEN,
    "agent-m.jump-host": JSON.stringify({ host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20003, reverseKey: "", forwardKey: "" }),
    "agent-m.remote-sessions": JSON.stringify([{ name: "lab-pc", port: 20001, bridgePort: 8765, token: "bridgeTOKEN-0123456789abcdef" }]) };
  const { box } = await settingsPage(world, entries);
  world.up.add(20001);
  await press(world.srv, among(box, "data-test-session", "lab-pc"));
  let again = await reload(world);
  assert.match(sessionLine(again.box), new RegExp(`<span class="state">✓ something answered at localhost:20001 — tested ${TODAY}</span>`));
  world.up.clear();
  await press(world.srv, among(again.box, "data-test-session", "lab-pc"));
  again = await reload(world);
  assert.match(sessionLine(again.box), /<span class="state">✗ nothing answered at localhost:20001 — start both commands<\/span>/);
  await press(world.srv, among(again.box, "data-clear-session", "lab-pc"));
  assert.equal(globalThis.localStorage.getItem("agent-m.remote-sessions"), null, "cleared with its session");
});
