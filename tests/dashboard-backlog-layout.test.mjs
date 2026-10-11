// The Backlog page in a real browser, at a phone's width and at a desktop's: no table, panel or chart reaches past the margins
// of the page's heading and the page does not scroll sideways — a wide table scrolls in a box of its own —; the burn-down
// chart's text is as large as the page's body text where the chart has its own width, and its line is drawn at least as wide
// as its axes, in a colour that stands out from the chart's background.
// Run: node --test tests/dashboard-backlog-layout.test.mjs
//
// Module: MOD-dashboard-app
// Guards: UC-032; UC-035
// Level: system
// Given: a controlled Electron browser in light mode and the review page served from this repository's files; the page's
//        requests to GitHub are answered by tests/app-harness.mjs' repository fake, which holds a product with two teams —
//        team1 runs its sprint 01 with three items, two of them merged, team2 closed its sprint 01 — and items whose titles and
//        modules are long.
// Input: open #backlog, open Plan sprint for team2, and lay the page out 390 px and 1280 px wide.
// Expected: at both widths the document is no wider than the window; each of the four tables stands in a box of its own that
//           scrolls sideways, and that box, every panel and the chart lie within the left and right edges of the page's
//           heading; the chart's line is at least as wide as each of its axes, and its colour has a contrast of at least 3:1
//           against the chart's background (WCAG 2.2, success criterion 1.4.11, non-text contrast); 1280 px wide, every text
//           of the chart is drawn as large as the page's body text.

import assert from "node:assert/strict";
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, normalize } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";
import { REPO, TOKEN, repoServer } from "./app-harness.mjs";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");

// ---------------------------------------------------------------- a controlled Electron, as TST-290115 runs it

const electronCache = join(tmpdir(), "agent-m-backlog-layout-electron-44");
const nativeFixtureLock = join(tmpdir(), "agent-m-276-native-fixture-lock");
const executableOf = (installed) => process.platform === "darwin" ? join(installed, "dist/Electron.app/Contents/MacOS/Electron") : join(installed, "dist/electron");
async function runtime() {
  const bundled = "/private/tmp/agent-m-electron-44/node_modules/electron";
  if (existsSync(executableOf(bundled))) return executableOf(bundled);
  const installed = join(electronCache, "node_modules/electron");
  if (!existsSync(executableOf(installed))) {
    const install = spawnSync("npm", ["install", "--no-save", "--prefix", electronCache, "electron@44.5.1"], { encoding: "utf8", timeout: 40000 });
    assert.equal(install.status, 0, `Electron package staging failed: ${install.stderr}`);
    const binary = spawnSync(process.execPath, [join(installed, "install.js")], { encoding: "utf8", timeout: 40000 });
    assert.equal(binary.status, 0, `Electron binary staging failed: ${binary.stderr}`);
  }
  assert.equal(existsSync(executableOf(installed)), true, "Electron 44.5.1 was not acquired.");
  return executableOf(installed);
}
function electronCommand(executable, arguments_) {
  if (process.platform !== "linux") return { command: executable, arguments_ };
  const display = spawnSync("xvfb-run", ["--help"], { encoding: "utf8", timeout: 5000 });
  assert.equal(display.status, 0, `Linux virtual display unavailable: ${display.stderr}`);
  let openbox = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  if (openbox.status !== 0) {
    const install = spawnSync("sudo", ["apt-get", "install", "--yes", "--no-install-recommends", "openbox"], { encoding: "utf8", timeout: 40000 });
    assert.equal(install.status, 0, `Linux Openbox installation failed: ${install.stderr}`);
    openbox = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  }
  assert.equal(openbox.status, 0, `Linux Openbox unavailable: ${openbox.stderr}`);
  return { command: "xvfb-run", arguments_: ["--auto-servernum", "--server-args=-screen 0 1280x1024x24", "sh", "-c", "openbox >/dev/null 2>&1 & wm=$!; trap 'kill \"$wm\" 2>/dev/null; wait \"$wm\" 2>/dev/null' EXIT INT TERM; \"$@\"; status=$?; exit \"$status\"", "agent-m-xvfb-openbox", executable, ...arguments_] };
}
const wait = async (read, fatal = () => {}, evidence = () => "") => { for (let n = 0; n < 160; n += 1) { fatal(); try { const value = await read(); if (value) return value; } catch {} await new Promise((resolve) => setTimeout(resolve, 125)); } fatal(); throw new Error(`Timed out waiting for controlled Electron.${evidence()}`); };
const acquireNativeFixtureLock = async () => { for (let n = 0; n < 240; n += 1) { try { mkdirSync(nativeFixtureLock); return; } catch (error) { if (error.code !== "EEXIST") throw error; } await new Promise((resolve) => setTimeout(resolve, 125)); } throw new Error("Timed out waiting for the controlled Electron fixture lock."); };
const cdpSession = async (url) => {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => { const value = JSON.parse(data), done = pending.get(value.id); if (!done) return; pending.delete(value.id); value.error ? done.reject(new Error(value.error.message)) : done.resolve(value.result); });
  return { call(method, params = {}) { const id = nextId++; return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); }); }, close() { socket.close(); } };
};
const evaluate = async (session, expression) => (await session.call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
const port = async () => await new Promise((resolve) => { const s = createServer(); s.listen(0, "127.0.0.1", () => { const value = s.address().port; s.close(() => resolve(value)); }); });

// ---------------------------------------------------------------- the fixture product

const SPEC = "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nThe first rule.\n*Check:* no automatic check; at review.\n";
const DECLARATION = ["---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md",
  `model_version: ${"a".repeat(40)}`, "---", "# How the fixture product is developed", "", "## Practices", "", "- none", "",
  "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | `sprint/<team>/<nn>` |", "",
  "## Definition of Done", "", "The job rules hold.", ""].join("\n");
const assignment = (team, owner, builder) => `# ${team}\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | ${owner} |\n`
  + `| Builders | ${builder} |\n| Checker | ${builder} |\n`;
const moduleFile = (id, uses) => `---\nid: ${id}\ntitle: The module ${id}\nfolder: src/${id.slice(4)}/\nrealises:\n  - RULE ONE\n`
  + `follows:\n  - ARC-001\nuses:${uses.length ? `\n${uses.map((u) => `  - ${u}`).join("\n")}` : " []"}\nprovides:\n  - read\n---\n`
  + `# ${id} The module ${id}\n`;
const id = (n) => `ITM-${String(n).padStart(3, "0")}`;
const itemText = (n, title, modules, buildsOn = []) => ["---", `id: ${id(n)}`, `title: ${title}`, "level: module", "realises:",
  "  - RULE ONE", "modules:", ...modules.map((m) => `  - ${m}`), ...(buildsOn.length ? ["builds_on:", ...buildsOn.map((b) => `  - ${b}`)]
    : ["builds_on: []"]), "tests:", "  - unit", "origin:", "  - RULE ONE", "---", `# ${id(n)} ${title}`, "", "## Outcome", "",
  `What item ${n} delivers.`, "", "## Acceptance", "", "- a unit test.", ""].join("\n");
const ITEMS = [
  [1, "Show each team's running sprint with the state of every item it holds", ["MOD-implementation-pages", "MOD-progress-measures"]],
  [2, "Read the product's pull requests once per page load and derive their merge times", ["MOD-repository-hosts"]],
  [3, "Draw the burn-down of a closed sprint from its start through each merge to its end", ["MOD-markdown-render"]],
  [4, "Name the module a held item changes beside every item it keeps from another team", ["MOD-markdown-render"], ["ITM-003"]],
  [5, "Count the items of a sprint left at its start, after each merge of one of them, and now", ["MOD-progress-measures"]],
];
const files = () => ({
  "SPEC.md": SPEC, "docs/process.md": DECLARATION, "docs/process-models/fixture.md": read("tests/fixtures/flow/scrum-wip.md"),
  "docs/role-assignments/team1.md": assignment("team1", "alice", "developer-with-a-long-account-name"),
  "docs/role-assignments/team2.md": assignment("team2", "bob", "developer-b"),
  "docs/architecture/MOD-repository-hosts.md": moduleFile("MOD-repository-hosts", []),
  "docs/architecture/MOD-progress-measures.md": moduleFile("MOD-progress-measures", ["MOD-repository-hosts.read"]),
  "docs/architecture/MOD-implementation-pages.md": moduleFile("MOD-implementation-pages", ["MOD-progress-measures.read", "MOD-markdown-render.read"]),
  "docs/architecture/MOD-markdown-render.md": moduleFile("MOD-markdown-render", []),
  ...Object.fromEntries(ITEMS.map(([n, title, modules, buildsOn]) => [`docs/backlog/${id(n)}-item-${n}.md`, itemText(n, title, modules, buildsOn)])),
  "docs/backlog/sprints/team1/01.md": "---\nsprint: 1\ngoal: Show the running sprints and how far each has come\nstart: 2026-09-14\nend:\n"
    + "closer: alice\nbranch: sprint/team1/01\nselection:\n  - ITM-001\n  - ITM-002\n  - ITM-005\n---\n# team1 Sprint 01\n",
  "docs/backlog/sprints/team2/01.md": "---\nsprint: 1\ngoal: Mail\nstart: 2026-09-01\nend: 2026-09-07\ncloser: bob\nbranch:\nselection:\n"
    + "  - ITM-003\n---\n# team2 Sprint 01\n\n## Review\n\nNo item is done.\n\n## Unfinished items\n\nto the backlog: ITM-003\n"
    + "into the next sprint:\n\nITM-003 waits for the mail server.\n\n## Retrospective\n\n- change: smaller items.\n",
});
const pr = ({ number, item, base, created, merged = null }) => ({ number, title: `${item}: the work of ${item}`,
  head: { ref: `team/${item}`, sha: "b".repeat(40) }, base: { ref: base }, state: merged ? "closed" : "open", created_at: created,
  merged_at: merged, merge_commit_sha: merged ? "f".repeat(40) : null, body: "developer-a · fixture-model\n\nWhat the pull request does." });
const PRS = [pr({ number: 1, item: "ITM-001", base: "sprint/team1/01", created: "2026-09-14T08:00:00Z", merged: "2026-09-14T09:30:00Z" }),
  pr({ number: 2, item: "ITM-002", base: "sprint/team1/01", created: "2026-09-14T08:10:00Z" }),
  pr({ number: 5, item: "ITM-005", base: "sprint/team1/01", created: "2026-09-14T08:20:00Z", merged: "2026-09-14T11:45:00Z" })];
const pullsApi = async (url, init) => {
  if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${REPO}/pulls` || init.method !== "GET") return null;
  const state = url.searchParams.get("state") ?? "open", per = Number(url.searchParams.get("per_page") ?? 30), page = Number(url.searchParams.get("page") ?? 1);
  const list = PRS.filter((p) => state === "all" || p.state === state).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return new Response(JSON.stringify(list.slice((page - 1) * per, page * per)), { status: 200, headers: { "Content-Type": "application/json" } });
};

// In the browser, before the dashboard loads: the harness's token is stored, and every request to GitHub goes to this test's
// server, which answers it from the repository fake — nothing leaves this machine.
function browserSide(token) {
  localStorage.setItem("agent-m.github-token", token);
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = String(input?.url ?? input);
    if (!/^https:\/\/(api\.github\.com|raw\.githubusercontent\.com)\//.test(url)) return nativeFetch(input, init);
    return nativeFetch("/__github", { method: "POST", body: JSON.stringify({ url, method: init.method ?? "GET", body: init.body ?? null }) });
  };
}
const fixture = (repository) => createServer(async (request, response) => {
  const raw = decodeURIComponent(new URL(request.url, "http://fixture").pathname);
  if (raw === "/__github" && request.method === "POST") {
    let text = "";
    for await (const chunk of request) text += chunk;
    const { url, method, body } = JSON.parse(text);
    const answer = await repository.fetch(url, body === null ? { method } : { method, body });
    response.writeHead(answer.status, Object.fromEntries(answer.headers));
    response.end(Buffer.from(await answer.arrayBuffer()));
    return;
  }
  const relative = raw === "/" || raw === "/docs/" ? "docs/index.html" : raw.replace(/^\//, "");
  const file = normalize(join(root, relative));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
  if (relative === "docs/index.html") {
    response.setHeader("content-type", "text/html");
    response.end(readFileSync(file, "utf8").replace("<head>", `<head><script>(${browserSide})(${JSON.stringify(TOKEN)});</script>`));
    return;
  }
  response.writeHead(200, { "content-type": relative.endsWith(".mjs") || relative.endsWith(".js") ? "text/javascript" : relative.endsWith(".css") ? "text/css" : relative.endsWith(".json") ? "application/json" : "application/octet-stream" });
  createReadStream(file).pipe(response);
});

// ---------------------------------------------------------------- what the page shows, measured in the browser

function measure() {
  const px = (value) => parseFloat(value);
  const edges = (element) => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right }; };
  const luminance = (colour) => {
    const [r, g, b] = colour.match(/[\d.]+/g).slice(0, 3).map((v) => Number(v) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => { const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (light + 0.05) / (dark + 0.05); };
  const svg = document.querySelector("[data-burn-down] svg");
  const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
  const line = svg.querySelector(".line-plot-0 path"), background = getComputedStyle(svg.querySelector("rect")).fill;
  return {
    document: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
    heading: edges(document.querySelector("main .head h2")),
    tables: [...document.querySelectorAll("main table")].map((table) => ({
      part: table.closest("section")?.getAttribute("data-team") ?? table.closest("section")?.getAttribute("data-part")
        ?? table.closest("section")?.getAttribute("data-plan-team"),
      box: { overflowX: getComputedStyle(table.parentElement).overflowX, holdsOnlyTheTable: table.parentElement.children.length === 1,
        ...edges(table.parentElement) } })),
    panels: [...document.querySelectorAll("main > section")].map((section) => ({ name: section.className, ...edges(section) })),
    chart: {
      ...edges(svg.closest(".mermaid")), scale, body: px(getComputedStyle(document.body).fontSize),
      texts: [...svg.querySelectorAll("text")].map((text) => ({ text: text.textContent, size: px(getComputedStyle(text).fontSize) * scale })),
      line: { width: px(getComputedStyle(line).strokeWidth) * scale, colour: getComputedStyle(line).stroke },
      axes: [...svg.querySelectorAll(".axis-line path, .axisl-line path")].map((axis) => px(getComputedStyle(axis).strokeWidth) * scale),
      background, contrast: contrast(getComputedStyle(line).stroke, background),
    },
  };
}

test("#backlog in a browser — tables, panels and the chart keep the heading's margins; the chart reads as clearly as its axes", { timeout: 120000, concurrency: false }, async (t) => {
  await acquireNativeFixtureLock();
  let child = null, server = null, entryFolder = null, released = false;
  const release = async () => {
    if (released) return;
    released = true;
    if (child?.exitCode === null) {
      if (process.platform === "linux" && child.pid) {
        try { process.kill(-child.pid, "SIGTERM"); }
        catch { child.kill(); }
      } else child.kill();
      child.stdout.destroy(); child.stderr.destroy(); child.unref();
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    if (entryFolder) rmSync(entryFolder, { recursive: true, force: true });
    rmSync(nativeFixtureLock, { recursive: true, force: true });
  };
  t.after(release);
  const electron = await runtime();
  const repository = await repoServer({ files: files(), handlers: [pullsApi] });
  server = fixture(repository); await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const debug = await port(), address = `http://127.0.0.1:${server.address().port}/docs/#backlog`;
  entryFolder = mkdtempSync(join(tmpdir(), "agent-m-backlog-layout-entry-"));
  const entry = join(entryFolder, "main.mjs");
  writeFileSync(entry, `import electron from "electron"; const start = async () => { const url = process.argv.find((value) => value.startsWith("--fixture-url="))?.slice("--fixture-url=".length); if (!url) throw new Error("Missing --fixture-url."); await electron.app.whenReady(); electron.app.dock?.hide(); electron.nativeTheme.themeSource = "light"; const window = new electron.BrowserWindow({ show: false, webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } }); electron.app.on("window-all-closed", () => electron.app.quit()); await window.loadURL(url); }; start().catch((failure) => { console.error(failure.message); electron.app?.quit?.(); });`);
  const launched = electronCommand(electron, [...(process.platform === "linux" ? ["--no-sandbox"] : []), `--remote-debugging-port=${debug}`, entry, `--fixture-url=${address}`]);
  child = spawn(launched.command, launched.arguments_, { cwd: root, detached: process.platform === "linux", stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "", spawnError = null;
  child.stdout.on("data", (chunk) => { stdout = `${stdout}${chunk}`.slice(-4000); });
  child.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
  child.on("error", (error) => { spawnError = error; });
  const stopped = () => { if (spawnError || child.exitCode !== null || child.signalCode !== null) throw new Error(`Controlled Electron stopped; argv=${JSON.stringify([launched.command, ...launched.arguments_])}; exit=${child.exitCode}; signal=${child.signalCode}; error=${spawnError?.code ?? null}; stdout=${stdout}; stderr=${stderr}`); };
  const target = await wait(async () => (await (await fetch(`http://127.0.0.1:${debug}/json/list`)).json())
    .find((item) => item.url.startsWith("http://127.0.0.1"))?.webSocketDebuggerUrl, stopped);
  const session = await cdpSession(target);
  try {
    const shown = (selectors) => `${JSON.stringify(selectors)}.every((selector) => document.querySelector(selector))`;
    await wait(async () => await evaluate(session, shown(["[data-burn-down] svg", '[data-part="backlog"] table'])), stopped,
      () => ` main=${JSON.stringify(stdout)} requests=${JSON.stringify(repository.requests.slice(-12))}`);
    await evaluate(session, `document.querySelector('[data-plan="team2"]').click(), true`);
    await wait(async () => await evaluate(session, shown(['[data-plan-team="team2"] table', '[data-part="held"] table', "[data-burn-down] svg"])), stopped);
    for (const width of [390, 1280]) {
      await session.call("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
      const result = await evaluate(session, `(${measure})()`);
      const actual = JSON.stringify(result);
      const within = (box) => box.left >= result.heading.left - 0.5 && box.right <= result.heading.right + 0.5;
      assert.ok(result.document.scrollWidth <= width, `${width}px: the page is no wider than the window; actual=${actual}`);
      assert.deepEqual(result.tables.map((table) => table.part), ["team1", "team2", "held", "backlog"],
        `${width}px: team1's sprint, the plan, the held items and the backlog each show a table; actual=${actual}`);
      for (const table of result.tables) {
        assert.ok(/^(auto|scroll)$/.test(table.box.overflowX) && table.box.holdsOnlyTheTable,
          `${width}px: the table of ${table.part} stands in a box of its own that scrolls sideways; actual=${actual}`);
        assert.ok(within(table.box), `${width}px: the box of ${table.part}'s table lies within the heading's margins; actual=${actual}`);
      }
      for (const panel of result.panels) assert.ok(within(panel), `${width}px: the panel ${panel.name} lies within the heading's margins; actual=${actual}`);
      assert.ok(within(result.chart), `${width}px: the chart lies within the heading's margins; actual=${actual}`);
      assert.ok(result.chart.axes.length >= 2, `known positive: the chart has its two axes; actual=${actual}`);
      for (const axis of result.chart.axes) assert.ok(result.chart.line.width >= axis, `${width}px: the chart's line is at least as wide as its axes; actual=${actual}`);
      assert.ok(result.chart.contrast >= 3, `${width}px: the chart's line stands out from its background at least 3:1; actual=${actual}`);
      if (width === 1280) {
        assert.equal(result.chart.scale, 1, `1280px: the chart has its own width; actual=${actual}`);
        assert.ok(result.chart.texts.length > 0, `known positive: the chart has texts; actual=${actual}`);
        for (const text of result.chart.texts) {
          assert.ok(Math.abs(text.size - result.chart.body) <= 0.5, `1280px: the chart's "${text.text}" is as large as the page's body text; actual=${actual}`);
        }
      }
    }
  } finally { session.close(); }
});
