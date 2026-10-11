// MOD-bridge-client — agents, hand-over, asks and agent probe (ITM-324).
// Module: MOD-bridge-client
// Guards: UC-011; UC-017; THE BRIDGE FINDS THE INSTALLED AGENTS; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
import assert from "node:assert/strict";
import test from "node:test";
import { BridgeError, bridgeAt, testBridge, handOver, ask, probe } from "../src/bridge-client/index.mjs";
const bridge = () => bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" });
const endpoint = { name: "local", kind: "openai-compatible", baseUrl: "http://127.0.0.1:11434", model: "small", key: "endpoint-key" };
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
function withFetch(t, fn) { const prior = globalThis.fetch; globalThis.fetch = fn; t.after(() => { globalThis.fetch = prior; }); }
// TST-324001
// given: a paired Bridge and its pair/agents answers
// input: testBridge(bridge)
// expect: it sends token-authenticated GET pair then GET agents and returns both answers
 test("TST-324001: testBridge pairs then lists offered and missing agents", async (t) => { const calls=[]; withFetch(t, async (url, init) => { calls.push([String(url), init]); return calls.length===1 ? response({bridge:{name:"Bridge",version:"1",platform:"linux"},origin:"https://agent.example"}) : response({agents:[{name:"codex",version:"1",ready:true,loggedIn:true}],missing:[{name:"claude"}]}); }); assert.deepEqual(await testBridge(bridge()), {bridge:{name:"Bridge",version:"1",platform:"linux"},origin:"https://agent.example",agents:[{name:"codex",version:"1",ready:true,loggedIn:true}],missing:[{name:"claude"}]}); assert.deepEqual(calls.map(([url])=>url), ["http://127.0.0.1:4711/v1/pair","http://127.0.0.1:4711/v1/agents"]); assert.ok(calls.every(([,init])=>init.headers["x-agent-m-bridge-token"] === "bridge-token")); });
// TST-324002
// given: a paired Bridge and a job record already committed
// input: handOver with product, record and commit
// expect: only those fields travel in the POST body and accepted is returned
 test("TST-324002: handOver posts the committed job identity", async (t) => { let call; withFetch(t, async (url, init) => { call={url:String(url),init}; return response({accepted:"JOB-324"}); }); assert.deepEqual(await handOver(bridge(), {product:"a/b",record:"docs/jobs/JOB-324.md",commit:"abc"}), {accepted:"JOB-324"}); assert.equal(call.url,"http://127.0.0.1:4711/v1/jobs"); assert.equal(call.init.method,"POST"); assert.deepEqual(JSON.parse(call.init.body),{product:"a/b",record:"docs/jobs/JOB-324.md",commit:"abc"}); });
// TST-324003
// given: a paired Bridge whose ask runs then completes
// input: ask an agent and ask an endpoint
// expect: each POST body carries only its target/input, polls to done, and endpoint key never enters an address
 test("TST-324003: ask sends agent or endpoint body then polls to done", async (t) => { const calls=[]; withFetch(t, async (url, init={}) => { calls.push([String(url),init]); return calls.length%2 ? response({ask:`ASK-${calls.length}`}) : response({state:"done",text:"draft",usage:{input:2}}); }); assert.deepEqual(await ask(bridge(),{agent:"codex"},"write"),{text:"draft",usage:{input:2}}); assert.deepEqual(await ask(bridge(),{endpoint},"write"),{text:"draft",usage:{input:2}}); assert.deepEqual(JSON.parse(calls[0][1].body),{agent:"codex",input:"write"}); assert.deepEqual(JSON.parse(calls[2][1].body),{endpoint,input:"write"}); assert.ok(calls.every(([url])=>!url.includes(endpoint.key))); });
// TST-324004
// given: a paired Bridge whose ask reports failure, and one agent probe
// input: ask then probe agent
// expect: failed ask is AskFailed and agent probe unwraps its answer
 test("TST-324004: ask names provider failure and agent probe uses its declared kind", async (t) => { let count=0; withFetch(t, async (url, init={}) => { count+=1; if(count===1)return response({ask:"ASK-324"}); if(count===2)return response({state:"failed",error:"agent unavailable"}); assert.equal(String(url),"http://127.0.0.1:4711/v1/probes/agent"); assert.deepEqual(JSON.parse(init.body),{args:{prompt:"ok"}}); return response({answer:{works:true}}); }); await assert.rejects(()=>ask(bridge(),{agent:"codex"},"write"),(error)=>error instanceof BridgeError&&error.name==="AskFailed"&&error.message==="agent unavailable"); assert.deepEqual(await probe(bridge(),"agent",{prompt:"ok"}),{works:true}); });
// TST-324005
// given: missing/refused tokens, Bridge errors, unreadable loopback response and timeout
// input: selected client operations
// expect: each named BridgeError is preserved and missing token sends no request
 test("TST-324005: selected calls name their declared BridgeErrors", async (t) => { let calls=0; withFetch(t, async ()=>{calls+=1; return response({error:"paused",message:"wait"},503);}); await assert.rejects(()=>handOver(bridgeAt({address:"http://127.0.0.1:4711",token:""}),{}),(e)=>e.name==="TokenMissing"); assert.equal(calls,0); await assert.rejects(()=>handOver(bridge(),{}),(e)=>e.name==="BridgeFailed"&&e.error==="paused"); globalThis.fetch=async()=>{throw new TypeError("blocked")}; await assert.rejects(()=>testBridge(bridge()),(e)=>e.name==="NoAnswer"&&e.likely[0]==="blocked by the browser"); });
