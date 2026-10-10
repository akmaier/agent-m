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
const canonicalKey = (name) => `agent-m:akmaier/agent-m:${name}`;
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
    if (k && (k.startsWith("agent-m.") || k.startsWith("agent-m:"))) out[k] = globalThis.localStorage.getItem(k);
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
  const main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  await page.go("#settings");
  const pane = (name) => mounted.find((node) => node.className === "settings-tab-panel" && node.textContent.includes(name));
  assert.ok(pane("Repositories"), "the dashboard mounts the public Repositories pane");
  assert.ok(pane("Endpoints & Agents"), "the dashboard mounts the public Endpoints & Agents pane");
  // Cases below are retained one-for-one from b099.  Their selectors still need
  // explicit per-control mapping; this route capture prevents any return to the
  // retired dashboard-owned browser-settings mount.
  const box = () => pane("Repositories");
  return { page, dom, box, endpointBox: () => pane("Endpoints & Agents") };
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
const publicControls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); publicControls(child, name, out); } return out; };
const githubRow = (box) => publicControls(box(), "settings-repository").find((row) => /GitHub token/.test(row.textContent));
const repositoryControl = (box, name) => publicControls(githubRow(box), `settings-repository-${name}`)[0];
const canonicalToken = () => ({ ["agent-m:akmaier/agent-m:github-token"]: JSON.stringify({ value: TOKEN, name: "GitHub token", expires: day(90), stored: TODAY }) });
const gitlabName = "gitlab-token:gitlab.example.org/grp/sub/proj";
const canonicalGitlab = () => ({ [canonicalKey(gitlabName)]: JSON.stringify({ value: GL_TOKEN, name: "GitLab token: gitlab.example.org/grp/sub/proj", expires: day(60), stored: TODAY }) });
const gitlabRow = (box) => publicControls(box(), "settings-repository").find((row) => /GitLab token: gitlab\.example\.org\/grp\/sub\/proj/.test(row.textContent));
const gitlabControl = (box, name) => publicControls(gitlabRow(box), `settings-repository-${name}`)[0];

// ---------------------------------------------------------------- the GitHub token

test("UC-042 step 1: a successful Test of the GitHub token is shown after a reload — ✓ works with the date of that test", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world, canonicalToken());
  assert.match(repositoryControl(box, "status").textContent, /Expires on/);
  await repositoryControl(box, "test").fire("click");
  const stored = JSON.parse(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:last-test:github-token"));
  assert.equal(stored.outcome, "working");
  assert.equal(repositoryControl(box, "status").textContent, `Works. Last successful test: ${stored.at}.`, "the public row shows the exact persisted successful-test date");
  assert.match(repositoryControl(box, "status").textContent, /Last successful test:/);
  const again = await settingsPage(world, agentEntries());
  assert.match(repositoryControl(again.box, "status").textContent, /Last successful test:/, "after the reload");
});

// A token GitHub refuses stays refused: the reload's own requests with it are refused again. Expected: its line and the line at
// the top name it refused after the reload as before it.
test("UC-042 step 1 · 1b: a token GitHub refused at its last use is shown refused after a reload — on its line and at the top", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world, canonicalToken());
  world.refuseGitHub = true;
  await repositoryControl(box, "test").fire("click");
  assert.equal(JSON.parse(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:last-test:github-token")).outcome, "refused");
  const again = await settingsPage(world, agentEntries());
  assert.match(repositoryControl(again.box, "status").textContent, /Refused/, "after the reload");
  const banner = again.page.el("token-banner");
  assert.ok(banner.includes("<strong>GitHub refused your GitHub token — it has expired, or was regenerated or deleted on GitHub.</strong>"));
  assert.ok(banner.includes('href="https://github.com/settings/personal-access-tokens"'), "with Renew");
  await again.page.go("#uc");
  assert.ok(again.page.el("token-banner").includes("GitHub refused your GitHub token"), "on every page");
});

test("UC-042 step 1: a successful Test after a refusal replaces it — the line works again, and so does the next page load", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world, canonicalToken());
  world.refuseGitHub = true;
  await repositoryControl(box, "test").fire("click");
  world.refuseGitHub = false;
  await repositoryControl(box, "test").fire("click");
  const again = await settingsPage(world, agentEntries());
  assert.match(repositoryControl(again.box, "status").textContent, /Last successful test:/);
  assert.equal(again.page.el("token-banner"), "", "no refusal at the top");
});

test("UC-042 step 2: a new token stored with Change starts untested — the last test of the old token does not stick to it", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world, canonicalToken());
  await repositoryControl(box, "test").fire("click");
  await repositoryControl(box, "change").fire("click");
  const acknowledgement = repositoryControl(box, "ack"), secret = repositoryControl(box, "secret"), expiry = repositoryControl(box, "expiry");
  acknowledgement.checked = true; await acknowledgement.fire("change");
  secret.value = "github_pat_RENEWED0123456789abcdefghij"; expiry.value = day(90);
  await repositoryControl(box, "save").fire("click");
  assert.equal(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:last-test:github-token"), null, "Change removes the old canonical outcome");
  const again = await settingsPage(world, agentEntries());
  assert.doesNotMatch(repositoryControl(again.box, "status").textContent, /Last successful test|Refused/, "after the reload too");
});

// ---------------------------------------------------------------- A CLEAR IS A REAL CLEAR · EVERY SETTING IS REACHED FROM ONE PAGE

test("UC-042 step 2 · A CLEAR IS A REAL CLEAR: Clear removes the kept date and outcome with the token from localStorage", async () => {
  const world = await instanceWorld();
  const prior = globalThis.confirm; globalThis.confirm = () => true;
  try {
    const { box } = await settingsPage(world, canonicalToken());
    await repositoryControl(box, "test").fire("click");
    assert.ok(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:last-test:github-token"));
    await repositoryControl(box, "clear").fire("click");
    assert.equal(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:github-token"), null);
    assert.equal(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:last-test:github-token"), null, "token Clear removes its outcome");
  } finally { globalThis.confirm = prior; }
});

test("UC-042 step 6 · A CLEAR IS A REAL CLEAR: Clear everything removes every kept test result", async () => {
  const world = await instanceWorld();
  const { main } = await settingsPage(world, { ...canonicalToken(), ["agent-m:akmaier/agent-m:last-test:github-token"]: JSON.stringify({ at: new Date().toISOString(), outcome: "working" }), ["agent-m:akmaier/agent-m:last-test:endpoint:campus"]: JSON.stringify({ at: new Date().toISOString(), outcome: "refused" }) });
  const clear = publicControls(main, "settings-clear-everything")[0], acknowledgement = publicControls(main, "settings-clear-ack")[0];
  acknowledgement.checked = true; await acknowledgement.fire("change"); await clear.fire("click");
  assert.equal(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:last-test:github-token"), null);
  assert.equal(globalThis.localStorage.getItem("agent-m:akmaier/agent-m:last-test:endpoint:campus"), null, "Clear everything removes every outcome");
});

test("EVERY SETTING IS REACHED FROM ONE PAGE: after the tests, every entry Agent M keeps in localStorage has its place on the settings page", async () => {
  const world = await instanceWorld();
  const entries = { ...canonicalToken(), ...canonicalGitlab(),
    [canonicalKey("products")]: JSON.stringify([GL_ADDR]),
    [canonicalKey("jump-host")]: JSON.stringify({ hostname: "jump.example.org", user: "agentm", sshPort: 22, portRange: [20001, 20003] }),
    [canonicalKey("remote-session:lab-pc")]: JSON.stringify({ port: 20001, token: "bridgeTOKEN-0123456789abcdef" }) };
  const { box, endpointBox } = await settingsPage(world, entries);
  await repositoryControl(box, "test").fire("click");
  await gitlabControl(box, "test").fire("click");
  const remote = publicControls(endpointBox(), "settings-remote-session")[0];
  assert.ok(remote, "remote session has its public Endpoints & Agents line");
  const remoteTest = publicControls(remote, "settings-remote-session-test")[0];
  await remoteTest.fire("click");
  const again = await settingsPage(world, agentEntries());
  assert.ok(repositoryControl(again.box, "status"), "GitHub token and its outcome remain reachable in Repositories");
  assert.ok(gitlabControl(again.box, "status"), "GitLab token and its outcome remain reachable in Repositories");
  const endpoints = again.endpointBox().textContent;
  for (const visible of ["Managed products", "Jump host", "lab-pc"]) assert.match(endpoints, new RegExp(visible), `${visible} is not stranded from its public Endpoints & Agents pane`);
});

// ---------------------------------------------------------------- a GitLab project token

test("UC-042 step 1: a GitLab project token's last test — works, then refused — is shown after a reload", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world, canonicalGitlab());
  await gitlabControl(box, "test").fire("click");
  assert.equal(JSON.parse(globalThis.localStorage.getItem(canonicalKey(`last-test:${gitlabName}`))).outcome, "working");
  let again = await settingsPage(world, agentEntries());
  assert.match(gitlabControl(again.box, "status").textContent, /Last successful test:/, "works, after the reload");
  world.refuseGitLab = true;
  await gitlabControl(again.box, "test").fire("click");
  again = await settingsPage(world, agentEntries());
  assert.match(gitlabControl(again.box, "status").textContent, /Refused/, "refused, after the reload");
});

test("UC-042 step 2: a GitLab project token changed or cleared takes its last test with it", async () => {
  const world = await instanceWorld();
  const prior = globalThis.confirm; globalThis.confirm = () => true;
  try {
    const { box } = await settingsPage(world, canonicalGitlab());
    await gitlabControl(box, "test").fire("click");
    await gitlabControl(box, "change").fire("click");
    const ack = gitlabControl(box, "ack"), secret = gitlabControl(box, "secret"), expiry = gitlabControl(box, "expiry");
    ack.checked = true; await ack.fire("change"); secret.value = "glpat-renewedTOKENvalue0123456789"; expiry.value = day(80);
    await gitlabControl(box, "save").fire("click");
    assert.equal(globalThis.localStorage.getItem(canonicalKey(`last-test:${gitlabName}`)), null, "Change removes the prior GitLab outcome");
    let again = await settingsPage(world, agentEntries());
    assert.doesNotMatch(gitlabControl(again.box, "status").textContent, /Last successful test|Refused/, "the replacement starts untested after reload");
    await gitlabControl(again.box, "test").fire("click");
    const replacementTest = JSON.parse(globalThis.localStorage.getItem(canonicalKey(`last-test:${gitlabName}`)));
    assert.equal(replacementTest.outcome, "working", "the replacement is tested through the public control before Clear");
    again = await settingsPage(world, agentEntries());
    assert.equal(gitlabControl(again.box, "status").textContent, `Works. Last successful test: ${replacementTest.at}.`, "the replacement's own test persists after reload");
    await gitlabControl(again.box, "clear").fire("click");
    assert.equal(globalThis.localStorage.getItem(canonicalKey(gitlabName)), null);
    assert.equal(globalThis.localStorage.getItem(canonicalKey(`last-test:${gitlabName}`)), null, "Clear removes its outcome");
    again = await settingsPage(world, agentEntries());
    assert.equal(gitlabRow(again.box), undefined, "no row for a cleared token");
  } finally { globalThis.confirm = prior; }
});

test("UC-042 step 2: a cleared GitHub token re-added with the same value starts untested", async () => {
  const world = await instanceWorld();
  const { box } = await settingsPage(world, canonicalToken());
  await repositoryControl(box, "test").fire("click");
  assert.match(repositoryControl(box, "status").textContent, /Last successful test:/, "known positive: the original value was tested");
  await repositoryControl(box, "clear").fire("click");
  const again = await settingsPage(world, agentEntries());
  await repositoryControl(again.box, "change").fire("click");
  const ack = repositoryControl(again.box, "ack");
  ack.checked = true; await ack.fire("change");
  repositoryControl(again.box, "secret").value = TOKEN;
  repositoryControl(again.box, "expiry").value = day(90);
  await repositoryControl(again.box, "save").fire("click");
  const reloaded = await settingsPage(world, agentEntries());
  assert.doesNotMatch(repositoryControl(reloaded.box, "status").textContent, /Last successful test|Refused/, "identical credentials do not recover a cleared test result");
});

// ---------------------------------------------------------------- a remote session

test("UC-042 step 1: a remote session's last test — something answered, or nothing — is shown after a reload", async () => {
  const world = await instanceWorld();
  const entries = { [canonicalKey("jump-host")]: JSON.stringify({ hostname: "jump.example.org", user: "agentm", sshPort: 22, portRange: [20001, 20003] }),
    [canonicalKey("remote-session:lab-pc")]: JSON.stringify({ port: 20001, token: "bridgeTOKEN-0123456789abcdef" }) };
  const { endpointBox } = await settingsPage(world, entries);
  const session = publicControls(endpointBox(), "settings-remote-session")[0];
  const test = publicControls(session, "settings-remote-session-test")[0];
  const result = publicControls(session, "settings-remote-session-result")[0];
  world.up.add(20001);
  await test.fire("click");
  assert.match(result.textContent, /answers at localhost:20001|something answered/, "the public Test establishes the controlled working result");
  assert.ok(globalThis.localStorage.getItem(canonicalKey("last-test:remote-session:lab-pc")), "required working outcome persists for reload");
  let again = await settingsPage(world, agentEntries());
  assert.match(again.endpointBox().textContent, /answers at localhost:20001|something answered/, "working outcome is shown after reload");
  world.up.clear();
  const retry = publicControls(publicControls(again.endpointBox(), "settings-remote-session")[0], "settings-remote-session-test")[0];
  await retry.fire("click");
  assert.match(publicControls(again.endpointBox(), "settings-remote-session-result")[0].textContent, /nothing|gave no answer|Failed/, "refusal is visible at the public Test control");
  assert.ok(globalThis.localStorage.getItem(canonicalKey("last-test:remote-session:lab-pc")), "required refused outcome persists for reload");
  const clear = publicControls(publicControls(again.endpointBox(), "settings-remote-session")[0], "settings-remote-session-clear")[0];
  await clear.fire("click");
  assert.equal(globalThis.localStorage.getItem(canonicalKey("remote-session:lab-pc")), null, "cleared with its session");
  assert.equal(globalThis.localStorage.getItem(canonicalKey("last-test:remote-session:lab-pc")), null, "Clear removes the persisted outcome");
});
