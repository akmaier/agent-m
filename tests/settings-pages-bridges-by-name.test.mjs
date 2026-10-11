// The Bridges this browser keeps, on the settings page (ITM-405) — MOD-settings-pages' route `bridge` and the Settings page's lines, as
// docs/architecture/MOD-settings-pages.md states them: each Bridge as a line of its own under its name, with Test at its address — for one
// reached through the jump host its HTTPS address, a certificate the browser does not trust named as a possible cause —, Change and Clear,
// which names first the endpoints and the mailbox that name it; pairing a Bridge under the name it reports; + Bridge through the jump host,
// named by the person, with its port from the range and the two tunnel commands; the jump host's line with its own Test; the web server's
// configuration for every Bridge reached through it.
// Run: node --test tests/settings-pages-bridges-by-name.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-011; UC-042; UC-044
// Guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; THE DASHBOARD WRITES THE TUNNEL COMMANDS; A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
// Level: unit
//
// The Bridge client is replaced by a stand-in for `fetch`, which answers as a Bridge does and records every request; the store is a Map-backed
// localStorage; the DOM is the small one the other tests of this module use. Names, addresses and tokens are constructed. Where the module file
// leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - The Bridges by name stand beside the single `bridge` and the remote sessions the pages show today, which stay as they are: the existing
//     tests of this module pin their form. A pairing whose answer names the Bridge stores it as `bridge:<name>`; one whose answer names none
//     keeps the single `bridge`, as before.
//   - Clear asks the person first, with the names of the endpoints (`bridge` is their field) and of the mailbox that name the Bridge; it clears
//     nothing on a refusal, and never changes the endpoints that name it. Participants and resources are not named: their pages are not in this folder.
//   - The jump host's Test calls its HTTPS address with its web-server login. The jump host serves only the paths of Bridges, so any answer of
//     its web server after the login is taken as working; only the refused login, no answer, and a missing HTTPS address are not. The request
//     carries a placeholder in the token header and no secret.
//   - A Bridge through the jump host that is added again under a name already stored keeps its port.
// The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() {}
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
globalThis.document = { createElement: (name) => new Element(name) };

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setTimeout(resolve, 5)); };
const routeNamed = (name) => view.routes.find((candidate) => candidate.name === name);

const LOGIN = { user: "proxy-user", password: "jump-host-password" };
const JUMP = { hostname: "jump.example.test", user: "agentm", sshPort: 22, portRange: [40100, 40102], httpsAddress: "https://jump.example.test", login: LOGIN };
const ORIGIN = "https://published.example.test";

function freshStore() { Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() }); return openStore("fixture/instance"); }
function stand(t, answer) {
  const calls = [];
  const prior = globalThis.fetch, priorConfirm = globalThis.confirm, priorLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return answer(String(url), init); };
  Object.defineProperty(globalThis, "location", { configurable: true, value: { origin: ORIGIN } });
  t.after(() => {
    globalThis.fetch = prior; globalThis.confirm = priorConfirm;
    if (priorLocation) Object.defineProperty(globalThis, "location", priorLocation); else delete globalThis.location;
  });
  return calls;
}
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
// The answers of a Bridge to the two requests of a test: who it is, and the agents it offers.
const bridgeAnswer = (name) => (url) => (url.endsWith("/v1/pair") ? json({ bridge: { name, version: "1", platform: "linux" }, origin: ORIGIN })
  : json({ agents: [{ name: "claude", version: "2", ready: true, loggedIn: true }], missing: [] }));
async function settingsPage(store) {
  const target = document.createElement("div");
  await routeNamed("settings").render(target, { instance: { repository: "fixture/instance" }, product: null, store, go() {} }, {});
  return target;
}
async function bridgePage(store, params = {}) {
  const target = document.createElement("div");
  await routeNamed("bridge").render(target, { instance: { repository: "fixture/instance" }, store, go() {} }, params);
  return target;
}
const lineOf = (page, name) => byClass(page, "settings-bridge-named").find((line) => byClass(line, "settings-bridge-named-name")[0]?.textContent === name);

// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: two Bridges kept by name, each with its own address and token, and a Bridge that answers for each
// input: the Settings page; Test on the first line, then on the second
// expect: a line for each Bridge under its name, its token hidden until Show; each Test requests only its own address, /v1/pair and /v1/agents,
//         with its own token in the protocol header; the line names the Bridge and its address as answering, and records the test for it alone
test("Settings — each Bridge is a line under its name and is tested at its own address with its own token", async (t) => {
  const store = freshStore();
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  writeSetting(store, "bridge:lab-forward", { address: "http://127.0.0.1:9222", token: "forward-token" });
  const calls = stand(t, bridgeAnswer("Bridge"));
  const page = await settingsPage(store);
  assert.deepEqual(byClass(page, "settings-bridge-named").map((line) => byClass(line, "settings-bridge-named-name")[0].textContent), ["lab-forward", "laptop"]);
  assert.equal(byClass(lineOf(page, "laptop"), "settings-bridge-named-token")[0].type, "password");
  await click(byClass(lineOf(page, "laptop"), "settings-bridge-named-show")[0]);
  assert.equal(byClass(lineOf(page, "laptop"), "settings-bridge-named-token")[0].type, "text");
  assert.equal(calls.length, 0, "listing makes no request");

  await click(byClass(lineOf(page, "laptop"), "settings-bridge-named-test")[0]);
  assert.deepEqual(calls.map((call) => call.url), ["http://127.0.0.1:4711/v1/pair", "http://127.0.0.1:4711/v1/agents"]);
  assert.ok(calls.every((call) => call.init.headers["x-agent-m-bridge-token"] === "laptop-token"));
  assert.match(byClass(lineOf(page, "laptop"), "settings-bridge-named-result")[0].textContent, /laptop.*http:\/\/127\.0\.0\.1:4711|http:\/\/127\.0\.0\.1:4711.*laptop/);
  assert.equal(readSetting(store, "last-test:bridge:laptop").outcome, "working");
  assert.equal(readSetting(store, "last-test:bridge:lab-forward"), null);

  await click(byClass(lineOf(page, "lab-forward"), "settings-bridge-named-test")[0]);
  assert.deepEqual(calls.slice(2).map((call) => call.url), ["http://127.0.0.1:9222/v1/pair", "http://127.0.0.1:9222/v1/agents"]);
  assert.ok(calls.slice(2).every((call) => call.init.headers["x-agent-m-bridge-token"] === "forward-token"));
});

// guards: A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; UC-044
// given: a Bridge at a port of the jump host's range, the jump host with its HTTPS address and web-server login; then a browser that refuses the
//        certificate; then a Bridge at a port with no jump host stored
// input: Test on its line
// expect: the requests go to https://jump.example.test/bridge/gpu-box/…, with the web login and the token; a refused connection names the certificate
//         as a possible cause, and the test is recorded as refused; without a jump host the line says the jump host is missing and requests nothing
test("Settings — a Bridge through the jump host is tested at its HTTPS path, naming the certificate when the browser refuses it", async (t) => {
  const store = freshStore();
  writeSetting(store, "jump-host", JUMP);
  writeSetting(store, "bridge:gpu-box", { port: 40100, token: "gpu-token" });
  let refuse = false;
  const calls = stand(t, (url, init) => { if (refuse) throw new TypeError("Failed to fetch"); return bridgeAnswer("gpu-box")(url, init); });
  const page = await settingsPage(store);
  const line = lineOf(page, "gpu-box");
  await click(byClass(line, "settings-bridge-named-test")[0]);
  assert.deepEqual(calls.map((call) => call.url), ["https://jump.example.test/bridge/gpu-box/v1/pair", "https://jump.example.test/bridge/gpu-box/v1/agents"]);
  assert.equal(calls[0].init.headers.Authorization, `Basic ${Buffer.from("proxy-user:jump-host-password").toString("base64")}`);
  assert.equal(calls[0].init.headers["x-agent-m-bridge-token"], "gpu-token");
  assert.equal(readSetting(store, "last-test:bridge:gpu-box").outcome, "working");

  refuse = true;
  await click(byClass(line, "settings-bridge-named-test")[0]);
  assert.match(byClass(line, "settings-bridge-named-result")[0].textContent, /certificate not trusted/);
  assert.equal(readSetting(store, "last-test:bridge:gpu-box").outcome, "refused");

  const bare = freshStore();
  writeSetting(bare, "bridge:gpu-box", { port: 40100, token: "gpu-token" });
  const before = calls.length;
  const barePage = await settingsPage(bare);
  await click(byClass(lineOf(barePage, "gpu-box"), "settings-bridge-named-test")[0]);
  assert.match(byClass(lineOf(barePage, "gpu-box"), "settings-bridge-named-result")[0].textContent, /jump host/i);
  assert.equal(calls.length, before);
});

// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: two endpoints, one of which names the Bridge gpu-box in its `bridge`, and a mailbox that names laptop
// input: Clear on the line of gpu-box, refused; Clear again, confirmed; Clear on laptop
// expect: the question names the endpoint that names gpu-box and not the other; a refusal clears nothing; a confirmation clears the Bridge and its
//         test record and leaves the endpoint as it was; the question for laptop names the mailbox
test("Settings — Clear names the endpoints and the mailbox that name the Bridge before it clears it", async (t) => {
  const store = freshStore();
  writeSetting(store, "bridge:gpu-box", { port: 40100, token: "gpu-token" });
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  writeSetting(store, "last-test:bridge:gpu-box", { at: "2026-10-11T08:00:00.000Z", outcome: "working" });
  const hpc = { url: "http://127.0.0.1:11434", kind: "ollama", model: "llama3", bridge: "gpu-box" };
  writeSetting(store, "endpoint:hpc", hpc);
  writeSetting(store, "endpoint:campus", { url: "https://models.example.test/v1", kind: "openai-compatible", model: "m", key: "k" });
  writeSetting(store, "mailbox", { route: "imap", address: "me@example.test", bridge: "laptop" });
  stand(t, bridgeAnswer("Bridge"));
  const asked = [];
  let answer = false;
  globalThis.confirm = (message) => { asked.push(message); return answer; };
  const page = await settingsPage(store);
  await click(byClass(lineOf(page, "gpu-box"), "settings-bridge-named-clear")[0]);
  assert.equal(asked.length, 1);
  assert.match(asked[0], /hpc/);
  assert.doesNotMatch(asked[0], /campus/);
  assert.deepEqual(readSetting(store, "bridge:gpu-box"), { port: 40100, token: "gpu-token" }, "a refusal clears nothing");

  answer = true;
  await click(byClass(lineOf(page, "gpu-box"), "settings-bridge-named-clear")[0]);
  assert.equal(readSetting(store, "bridge:gpu-box"), null);
  assert.equal(readSetting(store, "last-test:bridge:gpu-box"), null);
  assert.deepEqual(readSetting(store, "endpoint:hpc"), hpc, "the endpoint that named it is left as it was");
  assert.equal(lineOf(await settingsPage(store), "gpu-box"), undefined);

  const second = await settingsPage(store);
  await click(byClass(lineOf(second, "laptop"), "settings-bridge-named-clear")[0]);
  assert.match(asked.at(-1), /mailbox/i);
});

// guards: UC-044; THE DASHBOARD WRITES THE TUNNEL COMMANDS
// given: the Bridge route, and a Bridge on this computer that reports the name "lab-mac"; then another at a forwarded address that reports "lab-pc";
//        then one whose answer names none (the pairing the page has always made)
// input: Pair Bridge with the address and the copied token, for each
// expect: the first is stored as bridge:lab-mac with its address and token, the second as bridge:lab-pc beside it, the single `bridge` untouched; the
//         third is stored as the single `bridge`; the page names the reported name; Change for a stored name shows its address and token in the fields
test("Bridge route — pairing stores the Bridge under the name it reports", async (t) => {
  const store = freshStore();
  const reported = { "http://127.0.0.1:4711/v1/pair": "lab-mac", "http://127.0.0.1:9222/v1/pair": "lab-pc" };
  stand(t, (url) => (reported[url] ? json({ bridge: { name: reported[url], version: "1", platform: "linux" }, origin: ORIGIN }) : json({})));
  const page = await bridgePage(store);
  const pairWith = async (address, token) => {
    byClass(page, "bridge-address")[0].value = address;
    byClass(page, "bridge-token")[0].value = token;
    await click(byClass(page, "bridge-pair")[0]);
  };
  await pairWith("http://127.0.0.1:4711", "mac-token");
  assert.deepEqual(readSetting(store, "bridge:lab-mac"), { address: "http://127.0.0.1:4711", token: "mac-token" });
  assert.equal(readSetting(store, "bridge"), null);
  assert.match(byClass(page, "bridge-result")[0].textContent, /lab-mac/);
  await pairWith("http://127.0.0.1:9222", "pc-token");
  assert.deepEqual(readSetting(store, "bridge:lab-pc"), { address: "http://127.0.0.1:9222", token: "pc-token" });
  assert.deepEqual(readSetting(store, "bridge:lab-mac"), { address: "http://127.0.0.1:4711", token: "mac-token" });
  await pairWith("http://127.0.0.1:5555", "plain-token");
  assert.deepEqual(readSetting(store, "bridge"), { address: "http://127.0.0.1:5555", token: "plain-token" });

  const changed = await bridgePage(store, { name: "lab-pc" });
  assert.equal(byClass(changed, "bridge-address")[0].value, "http://127.0.0.1:9222");
  assert.equal(byClass(changed, "bridge-token")[0].value, "pc-token");
});

// guards: UC-011; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS
// given: a jump host with the ports 40100 to 40102, a Bridge through it at 40100, and one reached directly
// input: + Bridge through the jump host, named lab-pc, with its copied token; the same name again; a third and fourth name
// expect: bridge:lab-pc at 40101 — the lowest free port, the direct Bridge holding none — with its token; the reverse and forward commands filled in with
//         that port; the same name keeps its port; the next name takes 40102; the one after is refused for want of a free port and nothing is
//         written; no request was made
test("Bridge route — + Bridge through the jump host takes the lowest free port and writes the two tunnel commands", async (t) => {
  const store = freshStore();
  writeSetting(store, "jump-host", JUMP);
  writeSetting(store, "bridge:alpha", { port: 40100, token: "alpha-token" });
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  const calls = stand(t, () => { throw new Error("a setup screen makes no request"); });
  const page = await bridgePage(store);
  const add = async (name, token) => {
    byClass(page, "bridge-through-jump-name")[0].value = name;
    byClass(page, "bridge-through-jump-token")[0].value = token;
    await click(byClass(page, "bridge-through-jump-add")[0]);
  };
  await add("lab-pc", "lab-token");
  assert.deepEqual(readSetting(store, "bridge:lab-pc"), { port: 40101, token: "lab-token" });
  const commands = byClass(page, "bridge-through-jump-commands")[0].textContent;
  assert.match(commands, /-R 127\.0\.0\.1:40101:127\.0\.0\.1:4711/);
  assert.match(commands, /-L 127\.0\.0\.1:40101:127\.0\.0\.1:40101/);
  assert.ok(!commands.includes("lab-token"), "the commands carry no token");
  await add("lab-pc", "lab-token-2");
  assert.deepEqual(readSetting(store, "bridge:lab-pc"), { port: 40101, token: "lab-token-2" });
  await add("gpu-box", "gpu-token");
  assert.equal(readSetting(store, "bridge:gpu-box").port, 40102);
  await add("one-more", "more-token");
  assert.equal(readSetting(store, "bridge:one-more"), null);
  assert.match(byClass(page, "bridge-through-jump-result")[0].textContent, /no free port/i);
  assert.equal(calls.length, 0);

  const bare = await bridgePage(freshStore());
  byClass(bare, "bridge-through-jump-name")[0].value = "x";
  byClass(bare, "bridge-through-jump-token")[0].value = "t";
  await click(byClass(bare, "bridge-through-jump-add")[0]);
  assert.match(byClass(bare, "bridge-through-jump-result")[0].textContent, /jump host/i);
});

// guards: A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; UC-011
// given: two Bridges through the jump host and one reached directly
// input: the Bridge route
// expect: the Apache and nginx configuration name the path /bridge/<name>/ and the port of each Bridge through the jump host, the origin of the page,
//         and neither the direct Bridge nor any token
test("Bridge route — the web server's configuration covers every Bridge reached through the jump host", async (t) => {
  const store = freshStore();
  writeSetting(store, "jump-host", JUMP);
  writeSetting(store, "bridge:gpu-box", { port: 40100, token: "gpu-token" });
  writeSetting(store, "bridge:lab-pc", { port: 40101, token: "lab-token" });
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  stand(t, () => { throw new Error("no request"); });
  const page = await bridgePage(store);
  for (const [kind, shown] of [["apache", /<Location "\/bridge\/(gpu-box|lab-pc)\/">/g], ["nginx", /location \/bridge\/(gpu-box|lab-pc)\//g]]) {
    const text = byClass(page, `bridge-proxy-${kind}`)[0].textContent;
    assert.deepEqual([...text.matchAll(shown)].map((match) => match[1]).sort(), ["gpu-box", "lab-pc"]);
    assert.ok(text.includes("http://127.0.0.1:40100/") && text.includes("http://127.0.0.1:40101/"));
    assert.ok(text.includes(ORIGIN));
    assert.ok(!/laptop|-token/.test(text));
  }
});

// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; UC-044
// given: the jump host with its HTTPS address and login, whose web server answers 404 to a path it does not forward after the login; then one that
//        refuses the login; then a browser that gets no answer; then a jump host with no HTTPS address
// input: Test on the jump host's line, for each
// expect: the first call goes to the HTTPS address with the web login and no Bridge token, and the line says the jump host answers and records it as
//         working; the refusal names the login; no answer names the certificate; no HTTPS address requests nothing and says so
test("Settings — the jump host's line has a Test of its own", async (t) => {
  const store = freshStore();
  writeSetting(store, "jump-host", JUMP);
  let mode = "answers";
  const calls = stand(t, () => {
    if (mode === "refuses") return new Response("", { status: 401, headers: { "www-authenticate": "Basic realm=\"Agent M jump host\"" } });
    if (mode === "silent") throw new TypeError("Failed to fetch");
    return json({ error: "not-found" }, 404);
  });
  const page = await settingsPage(store);
  const line = () => byClass(page, "settings-jump-host")[0];
  await click(byClass(line(), "settings-jump-host-test")[0]);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.startsWith("https://jump.example.test"));
  assert.equal(calls[0].init.headers.Authorization, `Basic ${Buffer.from("proxy-user:jump-host-password").toString("base64")}`);
  assert.match(byClass(line(), "settings-jump-host-result")[0].textContent, /answers/i);
  assert.equal(readSetting(store, "last-test:jump-host").outcome, "working");

  mode = "refuses";
  await click(byClass(line(), "settings-jump-host-test")[0]);
  assert.match(byClass(line(), "settings-jump-host-result")[0].textContent, /login/i);
  assert.equal(readSetting(store, "last-test:jump-host").outcome, "refused");

  mode = "silent";
  await click(byClass(line(), "settings-jump-host-test")[0]);
  assert.match(byClass(line(), "settings-jump-host-result")[0].textContent, /certificate/i);

  const bare = freshStore();
  writeSetting(bare, "jump-host", { hostname: "jump.example.test", user: "agentm", sshPort: 22, portRange: [40100, 40102] });
  const barePage = await settingsPage(bare);
  const before = calls.length;
  await click(byClass(byClass(barePage, "settings-jump-host")[0], "settings-jump-host-test")[0]);
  assert.match(byClass(byClass(barePage, "settings-jump-host")[0], "settings-jump-host-result")[0].textContent, /HTTPS address/);
  assert.equal(calls.length, before);
});
