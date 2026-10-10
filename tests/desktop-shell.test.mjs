// Module: MOD-desktop-shell
// Guards: UC-044; UC-003; THE BRIDGE RUNS AS AN APP; THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW; THE BRIDGE IS PAIRED ONCE; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
// Level: component
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, rmdirSync, statSync, symlinkSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:net";

const root = new URL("..", import.meta.url).pathname;
const electronCache = join(tmpdir(), "agent-m-276-component-electron-44");
const ssh2Cache = join(tmpdir(), "agent-m-291-desktop-native-ssh2-1.17.0");
const nativeFixtureLock = join(tmpdir(), "agent-m-276-native-fixture-lock");
const electronModules = join(root, "node_modules");
const electronSsh2 = join(electronModules, "ssh2");
let nativeFixtureLockHeld = false;
let electronModulesCreated = false;
let electronSsh2Owned = false;
let runtimeFailure;
let sshRuntimeFailure;
let virtualDisplayFailure;
let windowManagerFailure;
const wait = async (f, fatal = () => {}) => { for (let n = 0; n < 240; n += 1) { fatal(); try { const value = await f(); if (value) return value; } catch {} await new Promise((resolve) => setTimeout(resolve, 125)); } throw new Error("Timed out waiting for real Electron."); };
const tokenOf = (folder) => readFileSync(join(folder, "pairing-token"), "utf8").trim();
const scrub = (value) => String(value).replace(/[A-Za-z0-9_-]{32,}/g, "[redacted]");
const within = async (promise, name) => {
  let timeout;
  try { return await Promise.race([promise, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error(`${name} timed out.`)), 5000); })]); }
  finally { clearTimeout(timeout); }
};
const acquireNativeFixtureLock = async () => {
  for (let n = 0; n < 240; n += 1) {
    try { mkdirSync(nativeFixtureLock); nativeFixtureLockHeld = true; return; }
    catch (failure) { if (failure.code !== "EEXIST") throw failure; }
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error("Timed out waiting for the native Electron fixture lock.");
};
const releaseNativeFixtureLock = () => {
  if (electronSsh2Owned) { unlinkSync(electronSsh2); electronSsh2Owned = false; }
  if (electronModulesCreated) { rmdirSync(electronModules); electronModulesCreated = false; }
  if (nativeFixtureLockHeld) { rmdirSync(nativeFixtureLock); nativeFixtureLockHeld = false; }
};
const commandEvidence = (stage, result) => {
  const evidence = { stage, status: result.status, signal: result.signal, error: result.error?.code ?? null, stdout: scrub(result.stdout), stderr: scrub(result.stderr) };
  process.stdout.write(`native-fixture ${JSON.stringify(evidence)}\n`);
  return evidence;
};
const publicUbuntuPackage = (uri) => {
  try {
    const parsed = new URL(uri);
    return ["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password && ["azure.archive.ubuntu.com", "archive.ubuntu.com"].includes(parsed.hostname) && (parsed.pathname === "/ubuntu" || parsed.pathname.startsWith("/ubuntu/"));
  } catch { return false; }
};
const credentialBearingUri = (uri) => { try { const parsed = new URL(uri); return Boolean(parsed.username || parsed.password); } catch { return false; } };
const sanitizedCliText = (value) => scrub(String(value).replace(/(https?:\/\/)[^/\s@]*@/gi, "$1[redacted]@"));
const recordedPackagePlan = (output) => String(output).split(/\r?\n/).flatMap((line) => {
  const match = /^'([^']+)'\s+(\S+)\s+(\d+)\s+(\S+)$/.exec(line);
  if (!match) return [];
  const [, uri, filename, bytes, digest] = match, md5 = /^(?:MD5Sum:)?([a-f0-9]{32})$/i.exec(digest)?.[1] ?? null, evidence = { filename, bytes: Number(bytes), md5, digest: md5 ?? scrub(digest), observation: md5 ? undefined : "unrecognized-digest" };
  if (uri.startsWith("mirror+file:")) return [{ transport: "mirror+file", ...evidence }];
  if (credentialBearingUri(uri)) return [{ transport: "credential-rejected", ...evidence }];
  if (publicUbuntuPackage(uri)) return [{ transport: new URL(uri).protocol.slice(0, -1), uri, ...evidence }];
  return [{ transport: "unrecorded", ...evidence }];
});
const publicMirrors = () => {
  try {
    return readFileSync("/etc/apt/apt-mirrors.txt", "utf8").split(/\r?\n/).map((line) => line.trim().split(/\s+/, 1)[0]).filter((uri) => publicUbuntuPackage(uri));
  } catch { return []; }
};
const diagnosticEvidence = (stage, evidence) => process.stdout.write(`native-fixture ${JSON.stringify({ stage, ...evidence })}\n`);
const diagnoseOpenboxAcquisition = () => {
  try {
    const started = Date.now();
    const resolution = spawnSync("sudo", ["apt-get", "--print-uris", "--yes", "--no-install-recommends", "install", "openbox"], { encoding: "utf8", timeout: 6000 });
    const packages = recordedPackagePlan(resolution.stdout);
    const font = packages.find((candidate) => candidate.filename.startsWith("fonts-urw-base35_") && candidate.filename.endsWith("_all.deb"));
    diagnosticEvidence("Linux Openbox diagnostic plan", { status: resolution.status, signal: resolution.signal, error: resolution.error?.code ?? null, elapsedMs: Date.now() - started, stdout: sanitizedCliText(resolution.stdout), stderr: sanitizedCliText(resolution.stderr), packages, mirrors: packages.some((candidate) => candidate.transport === "mirror+file") ? publicMirrors() : [], observation: !packages.length ? "unparseable-print-uris" : !font ? "fonts-package-not-resolved" : !font.md5 ? "font-digest-not-md5" : !font.uri?.startsWith("http://") ? "font-uri-not-direct-http" : "direct-http-font-uri" });
    if (!font?.uri?.startsWith("http://") || !font.md5) return;
    for (const scheme of ["http", "https"]) {
      const folder = mkdtempSync(join(tmpdir(), "agent-m-276-openbox-diagnostic-")), archive = join(folder, font.filename), uri = `${scheme}:${font.uri.slice("http:".length)}`;
      try {
        const acquired = Date.now(), result = spawnSync("curl", ["-q", "--fail", "--silent", "--show-error", "--location", "--proto", `=${scheme}`, "--proto-redir", `=${scheme}`, "--connect-timeout", "2", "--max-time", "5", "--output", archive, "--write-out", "%{http_code} %{size_download} %{time_total}", uri], { encoding: "utf8", timeout: 6000 });
        const body = existsSync(archive) ? readFileSync(archive) : null;
        diagnosticEvidence("Linux Openbox package probe", { scheme, status: result.status, signal: result.signal, error: result.error?.code ?? null, elapsedMs: Date.now() - acquired, stdout: sanitizedCliText(result.stdout), stderr: sanitizedCliText(result.stderr), expectedBytes: font.bytes, actualBytes: body?.length ?? 0, expectedMd5: font.md5, actualMd5: body ? createHash("md5").update(body).digest("hex") : null, bytesMatch: body?.length === font.bytes, hashMatch: body ? createHash("md5").update(body).digest("hex") === font.md5 : false });
      } finally { rmSync(folder, { recursive: true, force: true }); }
    }
  } catch (failure) { diagnosticEvidence("Linux Openbox diagnostic", { observation: "diagnostic-error", error: failure.code ?? failure.name }); }
};
const prepareNativeFixture = async () => {
  const executable = await runtime();
  electronCommand(executable, []);
  await acquireNativeFixtureLock();
  try {
    const target = join(sshRuntime(), "ssh2");
    if (!existsSync(electronModules)) { mkdirSync(electronModules); electronModulesCreated = true; }
    if (existsSync(electronSsh2)) {
      assert.equal(lstatSync(electronSsh2).isSymbolicLink(), true, "existing Electron ssh2 dependency link is not a link");
      assert.equal(readlinkSync(electronSsh2), target, "existing Electron ssh2 dependency link has another target");
    } else { symlinkSync(target, electronSsh2); electronSsh2Owned = true; }
    process.stdout.write(`native-fixture ${JSON.stringify({ stage: "ready", electron: "44.5.1", executable })}\n`);
  } catch (failure) { releaseNativeFixtureLock(); throw failure; }
};
before(prepareNativeFixture);
after(releaseNativeFixtureLock);

async function runtime() {
  const bundled = "/private/tmp/agent-m-electron-44/node_modules/electron";
  const executableOf = (installed) => process.platform === "darwin" ? join(installed, "dist/Electron.app/Contents/MacOS/Electron") : join(installed, "dist/electron");
  if (existsSync(executableOf(bundled))) return executableOf(bundled);
  if (runtimeFailure) throw runtimeFailure;
  const installed = join(electronCache, "node_modules/electron");
  const acquire = (stage, command, arguments_) => {
    const started = Date.now(), result = spawnSync(command, arguments_, { encoding: "utf8", timeout: 40000 });
    const evidence = commandEvidence(`Electron ${stage}`, result);
    if (result.status !== 0) throw new Error(`Electron ${stage} failed after ${Date.now() - started}ms; ${JSON.stringify(evidence)}`);
  };
  try {
    if (!existsSync(executableOf(installed))) {
      acquire("package acquisition", "npm", ["install", "--no-save", "--prefix", electronCache, "electron@44.5.1"]);
      acquire("binary acquisition", process.execPath, [join(installed, "install.js")]);
    }
    assert.equal(existsSync(executableOf(installed)), true, "Electron 44.5.1 executable was not acquired.");
    return executableOf(installed);
  } catch (failure) { runtimeFailure = failure; throw failure; }
}

function sshRuntime() {
  if (sshRuntimeFailure) throw sshRuntimeFailure;
  try {
    if (!existsSync(join(ssh2Cache, "node_modules", "ssh2", "package.json"))) {
      const installed = spawnSync("npm", ["install", "--no-save", "--prefix", ssh2Cache, "ssh2@1.17.0"], { encoding: "utf8", timeout: 40_000 });
      assert.equal(installed.status, 0, `ssh2 staging failed: ${installed.stderr}`);
    }
    const nodePath = join(ssh2Cache, "node_modules");
    const positive = spawnSync(process.execPath, ["-e", "const ssh2=require('ssh2');if(require('ssh2/package.json').version!=='1.17.0'||typeof ssh2.utils.generateKeyPairSync!=='function')throw Error('ssh2 known positive');console.log('ssh2-known-positive')"], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: nodePath } });
    assert.equal(positive.status, 0, `ssh2 known positive failed: ${positive.stderr}`);
    assert.match(positive.stdout, /ssh2-known-positive/);
    return nodePath;
  } catch (failure) { sshRuntimeFailure = failure; throw failure; }
}

const electronCommand = (executable, arguments_) => {
  if (process.platform !== "linux") return { command: executable, arguments_ };
  if (virtualDisplayFailure) throw virtualDisplayFailure;
  const probe = spawnSync("xvfb-run", ["--help"], { encoding: "utf8", timeout: 5000 });
  const displayEvidence = commandEvidence("Linux virtual display probe", probe);
  if (probe.status !== 0) {
    virtualDisplayFailure = new Error(`Linux virtual display probe failed; ${JSON.stringify(displayEvidence)}`);
    throw virtualDisplayFailure;
  }
  const manager = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
  commandEvidence("Linux Openbox initial probe", manager);
  if (manager.status !== 0) {
    if (windowManagerFailure) throw windowManagerFailure;
    diagnoseOpenboxAcquisition();
    const started = Date.now(), install = spawnSync("sudo", ["apt-get", "-o", "Debug::Acquire::http=true", "install", "--yes", "--no-install-recommends", "openbox"], { encoding: "utf8", timeout: 40000 });
    const installEvidence = commandEvidence("Linux Openbox install", install);
    let available = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
    let availableEvidence = commandEvidence("Linux Openbox ready probe", available);
    const locked = install.status !== 0 && /lock-frontend/.test(String(install.stderr));
    if (locked) {
      for (let n = 0; n < 160 && available.status !== 0; n += 1) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
        available = spawnSync("openbox", ["--version"], { encoding: "utf8", timeout: 5000 });
        availableEvidence = commandEvidence("Linux Openbox ready probe", available);
      }
    }
    if ((!locked && install.status !== 0) || available.status !== 0) {
      windowManagerFailure = new Error(`Linux Openbox fixture failed after ${Date.now() - started}ms; install=${JSON.stringify(installEvidence)}; probe=${JSON.stringify(availableEvidence)}`);
      throw windowManagerFailure;
    }
  }
  return { command: "xvfb-run", arguments_: ["--auto-servernum", "--server-args=-screen 0 1280x1024x24", "sh", "-c", "openbox >/dev/null 2>&1 & wm=$!; trap 'kill \"$wm\" 2>/dev/null; wait \"$wm\" 2>/dev/null' EXIT INT TERM; \"$@\"; status=$?; exit \"$status\"", "agent-m-xvfb-openbox", executable, ...arguments_] };
};

const cdp = async (url, method, params = {}) => {
  const socket = new WebSocket(url);
  await within(new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); socket.addEventListener("close", () => reject(new Error(`CDP ${method} closed before opening.`)), { once: true }); }), `CDP ${method} connection`);
  let answer;
  try { answer = await within(new Promise((resolve, reject) => { socket.addEventListener("message", ({ data }) => { const value = JSON.parse(data); if (value.id === 1) resolve(value); }); socket.addEventListener("error", reject, { once: true }); socket.addEventListener("close", () => reject(new Error(`CDP ${method} closed before responding.`)), { once: true }); socket.send(JSON.stringify({ id: 1, method, params })); }), `CDP ${method} response`); }
  finally { socket.close(); }
  if (answer.error) throw new Error(`CDP ${method} failed: ${answer.error.message}`);
  return answer.result;
};
const evaluate = async (url, expression) => {
  const result = await cdp(url, "Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(`CDP evaluation failed: ${result.exceptionDetails.text}`);
  return result.result.value;
};
const unusedPort = async () => await new Promise((resolve, reject) => { const server = createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const { port } = server.address(); server.close((failure) => failure ? reject(failure) : resolve(port)); }); });
const nativeClipboardEquals = async (app, value) => await evaluate(app.main, `(async () => { const electron = process.getBuiltinModule('module').createRequire(process.cwd() + '/src/desktop-shell/main.mjs')('electron'); return await electron.clipboard.readText() === ${JSON.stringify(value)}; })()`);
const debuggerSnapshot = async (url) => {
  try {
    const answer = await within(fetch(url), "launch debugger snapshot"), text = await within(answer.text(), "launch debugger body"), value = JSON.parse(text);
    return { status: answer.status, body: scrub(text).slice(-4000), value };
  } catch (error) { return { error: error.message }; }
};

async function launch({ folder = mkdtempSync(join(tmpdir(), "agent-m-276-test-")), port, debug, inspect, dataFolder = true, environment = {}, instance = "release-owner/release-frame", origin = "https://release-owner.github.io" } = {}) {
  port ??= await unusedPort();
  debug ??= await unusedPort();
  inspect ??= await unusedPort();
  const executable = await runtime();
  const args = [...(process.platform === "linux" ? ["--no-sandbox"] : []), `--inspect=${inspect}`, `--remote-debugging-port=${debug}`, "src/desktop-shell/main.mjs", `--instance=${instance}`, `--origin=${origin}`, `--port=${port}`];
  if (dataFolder) args.push(`--data-folder=${folder}`);
  const launched = electronCommand(executable, args);
  const child = spawn(launched.command, launched.arguments_, { cwd: root, detached: false, env: { ...process.env, ...environment }, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  child.stdout.on("data", (chunk) => { stdout = `${stdout}${chunk}`.slice(-4000); });
  child.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
  const exited = new Promise((resolve) => child.once("exit", resolve));
  const stopped = () => { if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Electron exited=${child.exitCode}; signal=${child.signalCode}; stderr=${scrub(stderr)}`); };
  let stage = "page";
  try {
    const page = await wait(async () => (await (await fetch(`http://127.0.0.1:${debug}/json/list`)).json()).find((candidate) => candidate.url.startsWith("agent-m://")), stopped);
    stage = "browser";
    const browser = await wait(async () => (await (await fetch(`http://127.0.0.1:${debug}/json/version`)).json()).webSocketDebuggerUrl, stopped);
    stage = "main";
    const main = await wait(async () => (await (await fetch(`http://127.0.0.1:${inspect}/json/list`)).json())[0]?.webSocketDebuggerUrl, stopped);
    return { browser, child, exited, folder, main, origin, page, port };
  } catch (failure) {
    const debugSnapshot = await debuggerSnapshot(`http://127.0.0.1:${debug}/json/list`);
    const inspectorSnapshot = await debuggerSnapshot(`http://127.0.0.1:${inspect}/json/list`);
    let mainRuntime = null;
    const main = inspectorSnapshot.value?.[0]?.webSocketDebuggerUrl;
    if (main) {
      try { mainRuntime = scrub(JSON.stringify(await evaluate(main, "({ stack: new Error().stack, argv: process.argv, exitCode: process.exitCode })"))); }
      catch (error) { mainRuntime = { error: error.message }; }
    }
    const diagnostic = { stage, exitCode: child.exitCode, signal: child.signalCode, stdout: scrub(stdout), stderr: scrub(stderr), debug: { status: debugSnapshot.status ?? null, body: debugSnapshot.body ?? null, error: debugSnapshot.error ?? null }, inspector: { status: inspectorSnapshot.status ?? null, body: inspectorSnapshot.body ?? null, error: inspectorSnapshot.error ?? null }, mainRuntime };
    if (child.exitCode === null) child.kill();
    await within(exited, "Electron startup cleanup").catch(() => {});
    failure.message = `${failure.message}; launch=${JSON.stringify(diagnostic)}`;
    throw failure;
  }
}

async function quit(app) {
  await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Quit')"));
  try { await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Quit').click()"); } catch {}
  await wait(async () => { try { await fetch(`http://127.0.0.1:${app.port}/v1/pair`); return false; } catch { return true; } });
  let timeout;
  try { await Promise.race([app.exited, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Electron did not exit after Quit.")), 30000); })]); }
  finally { clearTimeout(timeout); }
}
async function clean(app) { try { await quit(app); } finally { if (app.child.exitCode === null) app.child.kill(); } }

test("TST-276001: the actual Electron entry renders its forked pairing page and rotates its token", { timeout: 120000, concurrency: false }, async () => {
  const app = await launch();
  try {
    const token = await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    assert.equal(app.page.url, "agent-m://release-owner.github.io/release-frame/desktop-shell/window.html");
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Pair anew')"));
    assert.deepEqual(await evaluate(app.page.webSocketDebuggerUrl, "({ frame: document.body.innerText.includes('What is this?'), node: [typeof window.require, typeof window.process], local: performance.getEntriesByType('resource').every(x => x.name.startsWith('agent-m://')) })"), { frame: true, node: ["undefined", "undefined"], local: true });
    const pair = (value, origin = app.origin) => fetch(`http://127.0.0.1:${app.port}/v1/pair`, { headers: { origin, "x-agent-m-bridge-token": value } });
    assert.equal((await pair(token)).status, 200);
    assert.equal((await pair(token, "https://other.example")).status, 403);
    const sentinel = "agent-m-276-clipboard-sentinel";
    assert.equal(await evaluate(app.main, `(async () => { const electron = process.getBuiltinModule('module').createRequire(process.cwd() + '/src/desktop-shell/main.mjs')('electron'); await electron.clipboard.writeText(${JSON.stringify(sentinel)}); return await electron.clipboard.readText() === ${JSON.stringify(sentinel)}; })()`), true, "native clipboard sentinel");
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Copy address').click()");
    const address = `http://127.0.0.1:${app.port}`;
    const addressProbe = { display: await evaluate(app.page.webSocketDebuggerUrl, `document.querySelectorAll('code')[0].textContent === ${JSON.stringify(address)}`), clipboard: await wait(async () => await nativeClipboardEquals(app, address)) };
    assert.deepEqual(addressProbe, { display: true, clipboard: true }, "Copy address reaches the native clipboard");
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Copy token').click()");
    assert.equal(await wait(async () => await nativeClipboardEquals(app, token)), true, "Copy token reaches the native clipboard");
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Pair anew').click()");
    await evaluate(app.page.webSocketDebuggerUrl, "document.querySelector('.decision button:last-child').click()");
    const rotated = await wait(() => { const value = tokenOf(app.folder); return value !== token && value; });
    assert.equal((await pair(token)).status, 401);
    assert.equal((await pair(rotated)).status, 200);
  } catch (failure) { throw new Error(`${failure.message}; page=${app.page.url}`); }
  finally { await clean(app); }
});

test("TST-276002: pause refuses new work, resume restores the real server refusal, and Quit stops it", { timeout: 120000, concurrency: false }, async () => {
  const app = await launch();
  let didQuit = false;
  try {
    const token = await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    const work = () => fetch(`http://127.0.0.1:${app.port}/v1/probes/agent`, { method: "POST", headers: { origin: app.origin, "x-agent-m-bridge-token": token, "content-type": "application/json" }, body: JSON.stringify({ args: {} }) });
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Pause')"));
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Pause').click()");
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Resume')"));
    assert.equal((await work()).status, 503);
    await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].find(x => x.textContent === 'Resume').click()");
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Pause')"));
    assert.equal((await work()).status, 404);
    await quit(app);
    didQuit = true;
    await assert.rejects(fetch(`http://127.0.0.1:${app.port}/v1/pair`));
  } finally { if (!didQuit) await clean(app); }
});

test("TST-276003: an occupied port is visible and its replacement starts the same real composition", { timeout: 120000, concurrency: false }, async () => {
  const occupied = createServer(), port = await unusedPort();
  await new Promise((resolve, reject) => { occupied.once("error", reject); occupied.listen(port, "127.0.0.1", resolve); });
  let app;
  try {
    app = await launch({ port });
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "document.body.innerText.includes('Agent M Bridge could not start')"));
    assert.equal(await evaluate(app.page.webSocketDebuggerUrl, "document.querySelector('input[type=number]')?.value"), "4712");
    const replacement = await unusedPort();
    await evaluate(app.page.webSocketDebuggerUrl, `document.querySelector('input[type=number]').value=${replacement}; [...document.querySelectorAll('button')].find(x => x.textContent === 'Use this port').click()`);
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "[...document.querySelectorAll('button')].some(x => x.textContent === 'Copy token')"));
    const token = await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    assert.equal((await fetch(`http://127.0.0.1:${replacement}/v1/pair`, { headers: { origin: app.origin, "x-agent-m-bridge-token": token } })).status, 200);
  } finally { await new Promise((resolve) => occupied.close(resolve)); if (app) await clean(app); }
});

test("TST-276004: an unwritable private folder is shown without starting a server", { timeout: 120000, concurrency: false }, async () => {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-276-readonly-"));
  chmodSync(folder, 0o500);
  const app = await launch({ folder, port: await unusedPort() });
  try {
    await wait(async () => await evaluate(app.page.webSocketDebuggerUrl, "document.body.innerText.includes('Agent M Bridge could not start')"));
    assert.equal(await evaluate(app.page.webSocketDebuggerUrl, "document.body.innerText.includes('NotWritable')"), true);
    assert.equal(existsSync(join(folder, "pairing-token")), false);
  } finally { chmodSync(folder, 0o700); await clean(app); }
});

test("TST-276006: the production default stores the instance token privately", { timeout: 120000, concurrency: false }, async () => {
  const owner = `agentm276${Date.now()}`, instance = `${owner}/bridge`;
  const appData = process.platform === "darwin" ? join(process.env.HOME, "Library", "Application Support") : join(process.env.XDG_CONFIG_HOME ?? join(process.env.HOME, ".config"));
  const folder = join(appData, `io.github.${owner}.bridge.bridge`);
  const app = await launch({ dataFolder: false, instance });
  try {
    await wait(() => existsSync(join(folder, "pairing-token")));
    assert.equal(statSync(folder).mode & 0o777, 0o700);
    assert.equal(statSync(join(folder, "pairing-token")).mode & 0o777, 0o600);
  } finally { await clean(app); rmSync(folder, { recursive: true, force: true }); }
});

test("TST-276005: native close behavior and a second source start restore the first window", { timeout: 120000, concurrency: false }, async () => {
  const app = await launch();
  const second = [];
  try {
    const token = await wait(() => existsSync(join(app.folder, "pairing-token")) && tokenOf(app.folder));
    const state = "process.getBuiltinModule('module').createRequire(process.cwd() + '/src/desktop-shell/main.mjs')('electron').BrowserWindow.getAllWindows()[0]";
    assert.equal(await evaluate(app.main, `${state}.isVisible()`), true);
    await evaluate(app.main, `${state}.close()`);
    await wait(async () => await evaluate(app.main, process.platform === "linux" ? `!${state}.isDestroyed() && ${state}.isVisible()` : `!${state}.isDestroyed() && !${state}.isVisible()`));
    assert.equal((await fetch(`http://127.0.0.1:${app.port}/v1/pair`, { headers: { origin: app.origin, "x-agent-m-bridge-token": token } })).status, 200);
    const startSecond = async () => {
      const launched = electronCommand(await runtime(), [...(process.platform === "linux" ? ["--no-sandbox"] : []), "src/desktop-shell/main.mjs", "--instance=release-owner/release-frame", "--origin=https://release-owner.github.io", `--data-folder=${app.folder}`, `--port=${app.port}`]);
      const child = spawn(launched.command, launched.arguments_, { cwd: root, detached: process.platform === "darwin", env: { ...process.env }, stdio: "ignore" });
      child.unref(); second.push(child); return { child, exited: new Promise((resolve) => child.once("exit", resolve)) };
    };
    const observeSecond = async () => await evaluate(app.main, "(() => { globalThis.__agentMSecondInstanceCount ??= 0; process.getBuiltinModule('module').createRequire(process.cwd() + '/src/desktop-shell/main.mjs')('electron').app.once('second-instance', () => { globalThis.__agentMSecondInstanceCount += 1; }); return globalThis.__agentMSecondInstanceCount; })()");
    let count = await observeSecond(), started = await startSecond();
    await wait(async () => await evaluate(app.main, `globalThis.__agentMSecondInstanceCount === ${count + 1}`));
    await within(started.exited, "second source start exit");
    await wait(async () => await evaluate(app.main, `${state}.isVisible() && !${state}.isMinimized()`));
    await evaluate(app.main, `${state}.minimize()`);
    try { await wait(async () => await evaluate(app.main, `${state}.isMinimized()`)); }
    catch (failure) {
      if (process.platform !== "linux") throw failure;
      const manager = await evaluate(app.main, "(() => { try { const text = process.getBuiltinModule('child_process').execFileSync('xprop', ['-root', '_NET_SUPPORTING_WM_CHECK'], { encoding: 'utf8' }); return { available: true, windowManager: text.includes('_NET_SUPPORTING_WM_CHECK') }; } catch (error) { return { available: false, error: error.code ?? error.name }; } })()");
      const candidates = ["openbox", "fluxbox", "metacity", "xfwm4", "mutter", "kwin_x11"].map((command) => {
        const result = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 5000 });
        return { command, status: result.status, signal: result.signal, error: result.error?.code ?? null };
      });
      throw new Error(`${failure.message}; xprop=${JSON.stringify(manager)}; candidates=${JSON.stringify(candidates)}`);
    }
    count = await observeSecond(); started = await startSecond();
    await wait(async () => await evaluate(app.main, `globalThis.__agentMSecondInstanceCount === ${count + 1}`));
    await within(started.exited, "second source start exit");
    await wait(async () => await evaluate(app.main, `${state}.isVisible() && !${state}.isMinimized()`));
    assert.equal((await fetch(`http://127.0.0.1:${app.port}/v1/pair`, { headers: { origin: app.origin, "x-agent-m-bridge-token": token } })).status, 200);
  } finally {
    for (const child of second) child.kill();
    try {
      await evaluate(app.main, "process.getBuiltinModule('module').createRequire(process.cwd() + '/src/desktop-shell/main.mjs')('electron').app.quit()");
      await wait(async () => { try { await fetch(`http://127.0.0.1:${app.port}/v1/pair`); return false; } catch { return true; } });
      await within(app.exited, "Electron main-process quit");
    } finally { if (app.child.exitCode === null) app.child.kill(); }
  }
});
