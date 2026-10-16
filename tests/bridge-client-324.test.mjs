// MOD-bridge-client — agents, hand-over, asks and agent probe (ITM-324).
// Module: MOD-bridge-client
// Guards: UC-011; UC-017; THE BRIDGE FINDS THE INSTALLED AGENTS; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after } from "node:test";
import { BridgeError, bridgeAt, testBridge, handOver, ask, probe } from "../src/bridge-client/index.mjs";
const bridge = () => bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" });
const endpoint = { name: "local", kind: "openai-compatible", baseUrl: "http://127.0.0.1:11434", model: "small", key: "endpoint-key" };
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
function withFetch(t, fn) { const prior = globalThis.fetch; globalThis.fetch = fn; t.after(() => { globalThis.fetch = prior; }); }
const FAULTS = {
  "TST-324001": ['const agents = await call(bridge, route.path, { method: route.method });', 'const agents = { agents: [], missing: [] };'],
  "TST-324002": ['commit: job.commit, ...(job.task', 'commit: "fault", ...(job.task'],
  "TST-324003": ['calls: answer.calls ?? [], usage: answer.usage ?? null };', 'calls: [], usage: answer.usage ?? null };'],
  "TST-324004": ['["endpoint-test", "agent"].includes(kind)', '["endpoint-test"].includes(kind)'],
  "TST-324005": ['if (answer.status === 401)', 'if (answer.status === 402)'],
};
 // TST-324001 · level: unit · module: MOD-bridge-client
 // guards: UC-011; UC-017; THE BRIDGE FINDS THE INSTALLED AGENTS; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paired Bridge and its pair/agents answers
 // input: testBridge(bridge)
 // expect: it sends token-authenticated GET pair then GET agents and returns both answers
 test("TST-324001: testBridge pairs then lists offered and missing agents", async (t) => { const calls=[]; withFetch(t, async (url, init) => { calls.push([String(url), init]); return calls.length===1 ? response({bridge:{name:"Bridge",version:"1",platform:"linux"},origin:"https://agent.example"}) : response({agents:[{name:"codex",version:"1",ready:true,loggedIn:true}],missing:[{name:"claude"}]}); }); assert.deepEqual(await testBridge(bridge()), {bridge:{name:"Bridge",version:"1",platform:"linux"},origin:"https://agent.example",agents:[{name:"codex",version:"1",ready:true,loggedIn:true}],missing:[{name:"claude"}]}); assert.deepEqual(calls.map(([url])=>url), ["http://127.0.0.1:4711/v1/pair","http://127.0.0.1:4711/v1/agents"]); assert.deepEqual(calls.map(([,init])=>init.method),["GET","GET"]); assert.ok(calls.every(([,init])=>init.headers["x-agent-m-bridge-token"] === "bridge-token")); });
 // TST-324002 · level: unit · module: MOD-bridge-client
 // guards: UC-011; UC-017; THE BRIDGE FINDS THE INSTALLED AGENTS; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paired Bridge and a job record already committed
 // input: handOver with product, record and commit
 // expect: only those fields travel in the POST body and accepted is returned
 test("TST-324002: handOver posts the committed job identity", async (t) => { let call; withFetch(t, async (url, init) => { call={url:String(url),init}; return response({accepted:"JOB-324"}); }); assert.deepEqual(await handOver(bridge(), {product:"a/b",record:"docs/jobs/JOB-324.md",commit:"abc"}), {accepted:"JOB-324"}); assert.equal(call.url,"http://127.0.0.1:4711/v1/jobs"); assert.equal(call.init.method,"POST"); assert.equal(call.init.headers["x-agent-m-bridge-token"],"bridge-token"); assert.deepEqual(JSON.parse(call.init.body),{product:"a/b",record:"docs/jobs/JOB-324.md",commit:"abc"}); });
 // TST-324003 · level: unit · module: MOD-bridge-client
 // guards: UC-011; UC-017; UC-049; THE BRIDGE FINDS THE INSTALLED AGENTS; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paired Bridge whose ask runs then completes, the third answer carrying one tool call
 // input: ask an agent, ask an endpoint, and ask an endpoint with one exchange of a tool loop
 // expect: the POST bodies are exactly {agent,input}, {endpoint,input} and {endpoint,exchange}; each polls to done; the first two return calls [], the third returns [{id:"c1",name:"read",args:{path:"a"}}]; the endpoint key never enters an address
 test("TST-324003: ask sends agent, endpoint or exchange body, polls to done and returns calls", async (t) => {
  const exchange = { messages: [{ role: "user", text: "go" }], tools: [{ name: "read", description: "reads", input: {} }] };
  const calls = [], states = [{ ask: "ASK-agent" }, { state: "running" }, { state: "done", text: "draft", usage: { input: 2 } },
    { ask: "ASK-endpoint" }, { state: "running" }, { state: "done", text: "draft", usage: null },
    { ask: "ASK-exchange" }, { state: "running" }, { state: "done", text: "", calls: [{ id: "c1", name: "read", args: { path: "a" } }], usage: { input: 3 } }];
  withFetch(t, async (url, init = {}) => { calls.push([String(url), init]); return response(states.shift()); });
  assert.deepEqual(await ask(bridge(), { agent: "codex" }, "write"), { text: "draft", calls: [], usage: { input: 2 } });
  assert.deepEqual(await ask(bridge(), { endpoint }, "write"), { text: "draft", calls: [], usage: null });
  assert.deepEqual(await ask(bridge(), { endpoint, exchange }), { text: "", calls: [{ id: "c1", name: "read", args: { path: "a" } }], usage: { input: 3 } });
  assert.deepEqual(JSON.parse(calls[0][1].body), { agent: "codex", input: "write" });
  assert.deepEqual(JSON.parse(calls[3][1].body), { endpoint, input: "write" });
  assert.deepEqual(JSON.parse(calls[6][1].body), { endpoint, exchange });
  assert.deepEqual(calls.map(([url, init]) => [new URL(url).pathname, init.method, init.headers["x-agent-m-bridge-token"]]),
    [["/v1/ask", "POST", "bridge-token"], ["/v1/ask/ASK-agent", "GET", "bridge-token"], ["/v1/ask/ASK-agent", "GET", "bridge-token"],
     ["/v1/ask", "POST", "bridge-token"], ["/v1/ask/ASK-endpoint", "GET", "bridge-token"], ["/v1/ask/ASK-endpoint", "GET", "bridge-token"],
     ["/v1/ask", "POST", "bridge-token"], ["/v1/ask/ASK-exchange", "GET", "bridge-token"], ["/v1/ask/ASK-exchange", "GET", "bridge-token"]]);
  assert.ok(calls.every(([url]) => !url.includes(endpoint.key)));
});
 // TST-324004 · level: unit · module: MOD-bridge-client
 // guards: UC-011; UC-017; THE BRIDGE FINDS THE INSTALLED AGENTS; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paired Bridge whose ask reports failure, and one agent probe
 // input: ask then probe agent
 // expect: failed ask is AskFailed and agent probe unwraps its answer
 test("TST-324004: ask names provider failure and agent probe uses its declared kind", async (t) => { let count=0; withFetch(t, async (url, init={}) => { count+=1; if(count===1)return response({ask:"ASK-324"}); if(count===2)return response({state:"failed",error:"agent unavailable"}); assert.equal(String(url),"http://127.0.0.1:4711/v1/probes/agent"); assert.equal(init.method,"POST"); assert.equal(init.headers["x-agent-m-bridge-token"],"bridge-token"); assert.deepEqual(JSON.parse(init.body),{args:{prompt:"ok"}}); return response({answer:{works:true}}); }); await assert.rejects(()=>ask(bridge(),{agent:"codex"},"write"),(error)=>error instanceof BridgeError&&error.name==="AskFailed"&&error.message==="agent unavailable"); assert.deepEqual(await probe(bridge(),"agent",{prompt:"ok"}),{works:true}); });
 // TST-324005 · level: unit · module: MOD-bridge-client
 // guards: UC-011; UC-017; THE BRIDGE FINDS THE INSTALLED AGENTS; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: missing/refused tokens, Bridge errors, unreadable loopback response and timeout
 // input: selected client operations
 // expect: each named BridgeError is preserved and missing token sends no request
 test("TST-324005: selected calls name their declared BridgeErrors", async (t) => { let calls=0; withFetch(t, async ()=>{calls+=1; return response({error:"paused",message:"wait"},503);}); await assert.rejects(()=>handOver(bridgeAt({address:"http://127.0.0.1:4711",token:""}),{}),(e)=>e.name==="TokenMissing"); assert.equal(calls,0); await assert.rejects(()=>handOver(bridge(),{}),(e)=>e.name==="BridgeFailed"&&e.error==="paused"); globalThis.fetch=async()=>response({error:"token-refused",message:"pair again"},401); await assert.rejects(()=>handOver(bridge(),{}),(e)=>e.name==="TokenRefused"); globalThis.fetch=async()=>response({error:"invalid-request",message:"bad input"},422); await assert.rejects(()=>handOver(bridge(),{}),(e)=>e.name==="BridgeFailed"&&e.error==="invalid-request"); globalThis.fetch=async()=>{throw new DOMException("late","TimeoutError")}; await assert.rejects(()=>handOver(bridge(),{}),(e)=>e.name==="Timeout"); globalThis.fetch=async()=>{throw new TypeError("blocked")}; await assert.rejects(()=>testBridge(bridge()),(e)=>e.name==="NoAnswer"&&e.likely[0]==="blocked by the browser"&&e.message.includes("HTTPS")); });

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_324_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-324-fault-")), copied = join(temporary, "repo"), digest = (value) => createHash("sha256").update(value).digest("hex");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, "src/bridge-client/index.mjs"), original = readFileSync(source);
      assert.equal(original.toString().split(needle).length - 1, 1, `${id}: unique fault target`);
      const argv = [process.execPath, "--test", "--test-name-pattern", id, "tests/bridge-client-324.test.mjs"];
      const invoke = () => { const env = { ...process.env, AGENT_M_324_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT; return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 15_000, env }); };
      const sourceHash = digest(original), testHash = digest(readFileSync(join(copied, "tests/bridge-client-324.test.mjs")));
      let failed, passed, faultHash, restoredHash, faultEnded, restoreStarted, restoredEnded, positiveEnded; const faultStarted = new Date().toISOString();
      try { writeFileSync(source, original.toString().replace(needle, replacement)); faultHash = digest(readFileSync(source)); failed = invoke(); faultEnded = new Date().toISOString(); }
      finally { restoreStarted = new Date().toISOString(); writeFileSync(source, original); restoredHash = digest(readFileSync(source)); restoredEnded = new Date().toISOString(); }
      passed = invoke(); positiveEnded = new Date().toISOString();
      console.log("TST324-counterproof " + JSON.stringify({ id, source, needle, replacement, testHash, sourceHash, faultHash, restoredHash, faultStarted, faultEnded, restoreStarted, restoredEnded, positiveEnded, argv, cwd: copied, childflag: "AGENT_M_324_FAULT_CHILD=1", failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr } }));
      assert.equal(failed.status, 1, id); assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`)); assert.equal(restoredHash, sourceHash, `${id}: exact restoration`); assert.equal(passed.status, 0, id); assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
