// MOD-bridge-http — public pair-route protocol datum (ITM-453).
// Module: MOD-bridge-http
// Guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
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
