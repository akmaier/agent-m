// MOD-bridge-http — public pair-route protocol datum (ITM-453).
// Module: MOD-bridge-http
// Guards: A DATA FORMAT IS DEFINED ONCE
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bridgeApi } from "../src/bridge-http/index.mjs";

// TST-453001
// Precondition: the browser-loadable public Bridge protocol.
// Input: find GET /v1/pair in its public route data.
// Expected: its method, path, and accepted Bridge/origin answer fields are declared.
test("TST-453001: bridgeApi declares the accepted public pair route", () => {
  const route = bridgeApi.routes.find((candidate) => candidate.method === "GET" && candidate.path === "/v1/pair");
  assert.deepEqual(route, {
    method: "GET",
    path: "/v1/pair",
    answer: {
      bridge: { name: "string", version: "string", platform: "string" },
      origin: "string",
    },
  });
});

test.after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_453_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-453-fault-"));
  const copied = join(temporary, "repo");
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  const source = join(copied, "src/bridge-http/protocol.mjs");
  const testFile = join(copied, "tests/bridge-http-453.test.mjs");
  const needle = '{ method: "GET", path: "/v1/pair",';
  const replacement = '{ method: "POST", path: "/v1/pair",';
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    const original = readFileSync(source);
    assert.equal(original.toString().split(needle).length - 1, 1, "unique pair descriptor fault");
    const sourceHash = digest(original), testHash = digest(readFileSync(testFile));
    const argv = [process.execPath, "--test", "--test-name-pattern", "TST-453001", "tests/bridge-http-453.test.mjs"];
    const invoke = () => {
      const env = { ...process.env, AGENT_M_453_FAULT_CHILD: "1" };
      delete env.NODE_TEST_CONTEXT;
      return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 15_000, env });
    };
    let failed, passed, faultHash, restoredHash;
    const faultStarted = new Date().toISOString();
    try {
      writeFileSync(source, original.toString().replace(needle, replacement));
      faultHash = digest(readFileSync(source));
      failed = invoke();
    } finally { writeFileSync(source, original); }
    const restoredEnded = new Date().toISOString();
    restoredHash = digest(readFileSync(source));
    passed = invoke();
    const positiveEnded = new Date().toISOString();
    console.log("TST453-counterproof " + JSON.stringify({ sourceHash, testHash, faultHash, restoredHash, faultStarted, restoredEnded, positiveEnded, argv, cwd: copied, childflag: "AGENT_M_453_FAULT_CHILD=1", failed, passed }));
    assert.equal(failed.status, 1); assert.match(`${failed.stdout}\n${failed.stderr}`, /not ok \d+ - TST-453001/);
    assert.equal(restoredHash, sourceHash); assert.equal(passed.status, 0); assert.match(`${passed.stdout}\n${passed.stderr}`, /ok \d+ - TST-453001/);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
