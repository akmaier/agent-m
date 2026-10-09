export const endpointDiagnosisReasons = ["cross-origin refused", "opt-in header missing", "blocked by the browser", "not reachable", "key refused", "model unknown", "too long", "rate limited", "endpoint error"];

export const bridgeApi = {
  defaultPort: 4711,
  tokenHeader: "x-agent-m-bridge-token",
  endpointDiagnosisReasons,
  errors: {
    "token-refused": 401,
    "origin-refused": 403,
    "not-found": 404,
    "invalid-request": 422,
    "upstream-failed": 502,
    paused: 503,
  },
  routes: [
    { method: "POST", path: "/v1/probes/{kind}", kinds: ["agent", "endpoint-models", "endpoint-test", "partitions"], endpointTest: {
      args: { name: "string", kind: ["openai-compatible", "anthropic"], baseUrl: "string", model: "string", key: ["string", "null"] },
      answer: { works: [true, false], model: "string", diagnosis: { reason: endpointDiagnosisReasons, message: "string", routes: ["ci", "bridge"] } },
    } },
    { method: "GET", path: "/v1/tunnels", answer: { tunnels: [{ name: "string", kind: "string", state: "string", reason: ["string", "null"] }] } },
  ],
};

export function validEndpointTest(value) {
  return value && typeof value === "object" && typeof value.name === "string" && ["openai-compatible", "anthropic"].includes(value.kind)
    && typeof value.baseUrl === "string" && typeof value.model === "string" && (typeof value.key === "string" || value.key === null);
}
