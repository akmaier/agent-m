import { testEndpoint as nodeTestEndpoint } from "../endpoint-calls/index.mjs";

function validEndpointConfig(value) {
  return value && typeof value === "object" && typeof value.name === "string"
    && ["openai-compatible", "anthropic"].includes(value.kind) && typeof value.baseUrl === "string"
    && typeof value.model === "string" && (typeof value.key === "string" || value.key === null);
}

function failure(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function jobHandlers({ testEndpoint = nodeTestEndpoint } = {}) {
  return {
    "POST /v1/probes/endpoint-test": async ({ body }) => {
      if (!validEndpointConfig(body?.args)) throw failure("invalid-request", "Endpoint-test configuration is invalid.");
      try {
        const config = { name: body.args.name, kind: body.args.kind, baseUrl: body.args.baseUrl, model: body.args.model, key: body.args.key };
        return { answer: await testEndpoint(config) };
      } catch (error) {
        throw failure("upstream-failed", error?.message ?? "Bridge endpoint-test handler failed.");
      }
    },
  };
}
