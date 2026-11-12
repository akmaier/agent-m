// MOD-bridge-client — a message of the prompt bar to a CLI session kept running on its Bridge, as docs/architecture/MOD-bridge-client.md states it (ARC-055):
// "`ask(bridge, target: { agent, model?, product?, instance?, session? } …, input, options?: { onSession? })` — `POST /v1/ask` with … `{ agent, model?, product,
// instance, session?, input }` for a message of the prompt bar to a CLI session — `session` the running session it is typed into, none for a message that
// starts one —"; "For a message to a CLI session, `onSession` is called with the session's identifier as soon as the Bridge has accepted the request, before
// the answer is there"; "`BridgeFailed` with `not-found` for a session the Bridge holds no running session under"; and `bridgeJobLog` "-> { lines, next,
// partial, ended }".
// Run: node --test tests/bridge-client-session.test.mjs
//
// Module: MOD-bridge-client
// Guards: UC-049; UC-044; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// The Bridge is a fixture fetch that records every request and answers it. Each test states its input and its expected result before it runs.

import assert from "node:assert/strict";
import test from "node:test";
import { ask, bridgeAt, bridgeJobLog } from "../src/bridge-client/index.mjs";

const bridge = () => bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" });
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function bridgeFixture(t, answers) {
  const prior = globalThis.fetch;
  t.after(() => { globalThis.fetch = prior; });
  const sent = [];
  globalThis.fetch = async (url, init = {}) => {
    const { pathname, search } = new URL(String(url));
    sent.push({ method: init.method ?? "GET", path: `${pathname}${search}`, body: init.body ? JSON.parse(init.body) : null });
    return answers(pathname, init, sent);
  };
  return sent;
}

// TST-20261112561 · level: unit · module: MOD-bridge-client
// guards: UC-049; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a Bridge that accepts a message to a CLI session with { ask: ASK-1, session: JOB-20261112-1200-abcd } and answers the ask running, then done with "I split it."
// input: ask(bridge, { agent: claude, model: claude-opus-5-5, product: https://github.com/alice/widget, instance: c0ffee }, "split it", { onSession }); then the same naming the session JOB-20261112-1200-abcd
// expect: the first POST /v1/ask carries { agent, model, product, instance, input } and no session; onSession is called once with JOB-20261112-1200-abcd before the answer is there — while the ask still answers running —; ask returns { text: "I split it.", calls: [], usage: null }; the second POST carries session JOB-20261112-1200-abcd
test("TST-20261112561: a message to a CLI session names the running session it is typed into, and the Bridge's session is told before the answer", async (t) => {
  let follows = 0, toldAt = null;
  const sent = bridgeFixture(t, (path, init) => {
    if (init.method === "POST") return response({ ask: "ASK-1", session: "JOB-20261112-1200-abcd" });
    follows += 1;
    return response(follows < 2 ? { state: "running", text: null, calls: [], usage: null, error: null } : { state: "done", text: "I split it.", calls: [], usage: null, error: null });
  });
  const target = { agent: "claude", model: "claude-opus-5-5", product: "https://github.com/alice/widget", instance: "c0ffee" };
  const told = [];
  const answered = await ask(bridge(), target, "split it", { onSession: (session) => { told.push(session); toldAt = follows; } });
  assert.deepEqual(answered, { text: "I split it.", calls: [], usage: null });
  assert.deepEqual(told, ["JOB-20261112-1200-abcd"]);
  assert.equal(toldAt, 0, "the session is told before the answer is asked for");
  assert.deepEqual(sent[0].body, { ...target, input: "split it" });
  await ask(bridge(), { ...target, session: "JOB-20261112-1200-abcd" }, "and the next one");
  assert.equal(sent.filter((each) => each.method === "POST")[1].body.session, "JOB-20261112-1200-abcd");
});

// TST-20261112562 · level: unit · module: MOD-bridge-client
// guards: UC-049; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a Bridge that answers a message naming the session JOB-gone with 404 { error: "not-found" }; and, as the known positive, one that accepts it
// input: ask(bridge, { agent: claude, product, instance, session: JOB-gone }, "hello", { onSession })
// expect: it rejects with BridgeFailed whose error is not-found, and onSession is not called; the known positive resolves
test("TST-20261112562: a message to a session the Bridge no longer runs fails as not-found", async (t) => {
  let known = false;
  bridgeFixture(t, (path, init) => {
    if (init.method === "POST") return known ? response({ ask: "ASK-2", session: "JOB-gone" }) : response({ error: "not-found", message: "This Bridge runs no such session." }, 404);
    return response({ state: "done", text: "hi", calls: [], usage: null, error: null });
  });
  const told = [];
  const target = { agent: "claude", product: "https://github.com/alice/widget", instance: "c0ffee", session: "JOB-gone" };
  await assert.rejects(ask(bridge(), target, "hello", { onSession: (session) => told.push(session) }), (error) => error.name === "BridgeFailed" && error.error === "not-found");
  assert.deepEqual(told, []);
  known = true;
  assert.equal((await ask(bridge(), target, "hello")).text, "hi");
});

// TST-20261112563 · level: unit · module: MOD-bridge-client
// guards: UC-049; UC-044
// given: a Bridge whose log of the session JOB-1 answers { lines: ["fixture claude ready"], next: 1, partial: "> split it\n✻ Cooked for 1s · done 8:31 PM", ended: false }
// input: bridgeJobLog(bridge, JOB-1, 0)
// expect: GET /v1/jobs/JOB-1/log?from=0, answered with the lines, next, partial — the lines the session's screen shows — and ended, as the Bridge gave them
test("TST-20261112563: a session's console is read with the part its screen shows", async (t) => {
  const log = { lines: ["fixture claude ready"], next: 1, partial: "> split it\n✻ Cooked for 1s · done 8:31 PM", ended: false };
  const sent = bridgeFixture(t, () => response(log));
  assert.deepEqual(await bridgeJobLog(bridge(), "JOB-1", 0), log);
  assert.deepEqual(sent.map(({ method, path }) => `${method} ${path}`), ["GET /v1/jobs/JOB-1/log?from=0"]);
});
