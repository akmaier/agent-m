// The controlled Electron that tests/site-usability.test.mjs draws the site's pages in, and the wait that bounds every condition by
// the clock. It is the engine tests/dashboard-backlog-layout.test.mjs and tests/release-itm-290-public-settings-layout.test.mjs run
// (Electron 44.5.1 from npm, under xvfb-run and openbox on Linux, driven over the Chrome DevTools Protocol), so that the page has the
// geometry a browser gives it. Staging holds the lock of tests/desktop-shell.test.mjs while Electron is fetched and openbox installed,
// and releases it before the window opens: those are the steps two test files must not do at once. It is test code; it holds no
// expected result.
//
// Module: MOD-site-frame
// Level: system

import { existsSync, mkdirSync, mkdtempSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const electronCache = join(tmpdir(), "agent-m-904-site-usability-electron-44");
const nativeFixtureLock = join(tmpdir(), "agent-m-276-native-fixture-lock");
const executableOf = (installed) => process.platform === "darwin" ? join(installed, "dist/Electron.app/Contents/MacOS/Electron") : join(installed, "dist/electron");

// until(name, condition, limitMs = 30000) -> Promise<any> — the first truthy value `condition` returns; it is tried every 100 ms and a
// try that has not answered by the deadline is given up. At the deadline it throws "<name> did not hold within <n> s" and the last error.
export async function until(name, condition, limitMs = 30000) {
  const deadline = Date.now() + limitMs;
  let lastError;
  for (;;) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    let timer;
    try {
      const value = await Promise.race([condition(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("deadline")), remaining); })]);
      if (value) return value;
    } catch (failure) { lastError = failure; } finally { clearTimeout(timer); }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${name} did not hold within ${limitMs / 1000} s; last error: ${lastError?.message ?? "none"}`);
}

async function acquireLock() {
  for (let n = 0; n < 240; n += 1) {
    try { mkdirSync(nativeFixtureLock); return; } catch (error) { if (error.code !== "EEXIST") throw error; }
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error("Timed out waiting for the controlled Electron fixture lock.");
}

function runtime() {
  const bundled = "/private/tmp/agent-m-electron-44/node_modules/electron";
  if (existsSync(executableOf(bundled))) return executableOf(bundled);
  const installed = join(electronCache, "node_modules/electron");
  if (!existsSync(executableOf(installed))) {
    const install = spawnSync("npm", ["install", "--no-save", "--prefix", electronCache, "electron@44.5.1"], { encoding: "utf8", timeout: 40000 });
    if (install.status !== 0) throw new Error(`Electron package staging failed: ${install.stderr}`);
    const binary = spawnSync(process.execPath, [join(installed, "install.js")], { encoding: "utf8", timeout: 40000 });
    if (binary.status !== 0) throw new Error(`Electron binary staging failed: ${binary.stderr}`);
  }
  if (!existsSync(executableOf(installed))) throw new Error("Electron 44.5.1 was not acquired.");
  return executableOf(installed);
}

function electronCommand(executable, arguments_) {
  if (process.platform !== "linux") return { command: executable, arguments_ };
  const display = spawnSync("xvfb-run", ["--help"], { encoding: "utf8", timeout: 5000 });
  if (display.status !== 0) throw new Error(`Linux virtual display unavailable: ${display.stderr}`);
  let openbox = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  if (openbox.status !== 0) {
    const install = spawnSync("sudo", ["apt-get", "-o", "DPkg::Lock::Timeout=50", "-o", "Acquire::Retries=3", "install", "--yes", "--no-install-recommends", "openbox"], { encoding: "utf8", timeout: 60000 });
    if (install.status !== 0) throw new Error(`Linux Openbox installation failed: ${install.stderr}`);
    openbox = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  }
  if (openbox.status !== 0) throw new Error(`Linux Openbox unavailable: ${openbox.stderr}`);
  return { command: "xvfb-run", arguments_: ["--auto-servernum", "--server-args=-screen 0 1280x1024x24", "sh", "-c", "openbox >/dev/null 2>&1 & wm=$!; trap 'kill \"$wm\" 2>/dev/null; wait \"$wm\" 2>/dev/null' EXIT INT TERM; \"$@\"; status=$?; exit \"$status\"", "agent-m-xvfb-openbox", executable, ...arguments_] };
}

const freePort = () => new Promise((resolve) => { const s = createServer(); s.listen(0, "127.0.0.1", () => { const value = s.address().port; s.close(() => resolve(value)); }); });

// The main process of the window: Electron's light theme, a hidden window that loads the address it is given.
const ENTRY = `import electron from "electron"; const start = async () => { const url = process.argv.find((value) => value.startsWith("--fixture-url="))?.slice("--fixture-url=".length); if (!url) throw new Error("Missing --fixture-url."); await electron.app.whenReady(); electron.app.dock?.hide(); electron.nativeTheme.themeSource = "light"; const window = new electron.BrowserWindow({ show: false, webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } }); electron.app.on("window-all-closed", () => electron.app.quit()); await window.loadURL(url); }; start().catch((failure) => { console.error(failure.message); electron.app?.quit?.(); });`;

async function session(url) {
  const socket = new WebSocket(url);
  await until("the DevTools socket opens", () => new Promise((resolve, reject) => {
    if (socket.readyState === 1) resolve(true);
    socket.addEventListener("open", () => resolve(true), { once: true });
    socket.addEventListener("error", () => reject(new Error("the DevTools socket failed")), { once: true });
  }), 15000);
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const value = JSON.parse(data), done = pending.get(value.id);
    if (!done) return;
    pending.delete(value.id);
    if (value.error) done.reject(new Error(value.error.message)); else done.resolve(value.result);
  });
  const call = (method, params = {}, within = 30000) => new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} was not answered within ${within / 1000} s`)); }, within);
    pending.set(id, { resolve: (value) => { clearTimeout(timer); resolve(value); }, reject: (failure) => { clearTimeout(timer); reject(failure); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
  return {
    call,
    // evaluate(expression) -> the value the expression gives in the page, which may be a promise; an exception in the page throws here.
    // `within` is how long the answer may take: an evaluation sent while a document is being replaced can be lost, so a caller that can send it again gives it a short time.
    async evaluate(expression, within = 30000) {
      const answer = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, within);
      if (answer.exceptionDetails) throw new Error(`The page threw: ${answer.exceptionDetails.exception?.description ?? answer.exceptionDetails.text}`);
      return answer.result.value;
    },
    close() { socket.close(); },
  };
}

// stageElectron() -> Promise<string> — the Electron executable, fetched and ready, and openbox installed where the screen is virtual.
export async function stageElectron() {
  await acquireLock();
  try {
    const started = Date.now();
    const executable = runtime();
    console.log(`site-usability staging: Electron ready after ${Date.now() - started} ms`);
    electronCommand(executable, []);
    console.log(`site-usability staging: display and window manager ready after ${Date.now() - started} ms`);
    return executable;
  } finally { rmdirSync(nativeFixtureLock); }
}

// openWindow(executable, address) -> Promise<{ page, close }> — a hidden Electron window that has loaded `address`; `page` is the
// DevTools session of its page (call, evaluate, close). `close` ends the page's session and the Electron, and removes its folder.
export async function openWindow(executable, address) {
  const debug = await freePort();
  const folder = mkdtempSync(join(tmpdir(), "agent-m-904-entry-"));
  const entry = join(folder, "main.mjs");
  writeFileSync(entry, ENTRY);
  const launched = electronCommand(executable, [...(process.platform === "linux" ? ["--no-sandbox"] : []), `--remote-debugging-port=${debug}`, entry, `--fixture-url=${address}`]);
  const child = spawn(launched.command, launched.arguments_, { detached: process.platform === "linux", stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "", spawnError = null, page = null;
  child.stdout.on("data", (chunk) => { stdout = `${stdout}${chunk}`.slice(-4000); });
  child.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
  child.on("error", (error) => { spawnError = error; });
  const close = () => {
    page?.close();
    if (child.exitCode === null) {
      if (process.platform === "linux" && child.pid) { try { process.kill(-child.pid, "SIGTERM"); } catch { child.kill(); } } else child.kill();
    }
    child.stdout.destroy(); child.stderr.destroy(); child.unref();
    rmSync(folder, { recursive: true, force: true });
  };
  try {
    const target = await until("the window's page appears among the debugging targets", async () => {
      if (spawnError || child.exitCode !== null) throw new Error(`Electron stopped; exit=${child.exitCode}; error=${spawnError?.code ?? null}; stdout=${stdout}; stderr=${stderr}`);
      return (await (await fetch(`http://127.0.0.1:${debug}/json/list`)).json()).find((item) => item.url.startsWith("http://127.0.0.1"))?.webSocketDebuggerUrl;
    });
    page = await session(target);
    // The page domain must be enabled for a script to be added to every new document, and a first evaluation must have run in the
    // document that is open, or the first one after a navigation is never answered.
    await page.call("Page.enable");
    await page.evaluate("document.readyState");
    return { page, close };
  } catch (failure) { close(); throw failure; }
}
