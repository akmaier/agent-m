// MOD-endpoint-calls — the direct short test and diagnosis that UC-003 needs. The endpoint driver, job execution,
// correction loop, and Bridge composition are intentionally not part of ITM-260.

/**
 * @typedef {{ name: string, kind: "openai-compatible" | "anthropic", baseUrl: string, model: string, key: string | null }} EndpointConfig
 */

/**
 * @typedef {{ reason: "cross-origin refused" | "opt-in header missing" | "blocked by the browser" | "not reachable" | "key refused" | "model unknown" | "too long" | "rate limited" | "endpoint error", message: string, routes: ("ci" | "bridge")[] }} Diagnosis
 */

const ONE_WORD_PROMPT = "Reply with one word: ok.";
const DRIVER_MAX_TOKENS = 1024;

export class EndpointFailed extends Error {
  constructor(diagnosis) {
    super(diagnosis.message);
    this.name = "EndpointFailed";
    this.diagnosis = diagnosis;
  }
}

function endpointUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

function requestFor(config) {
  if (config.kind === "anthropic") {
    const headers = {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    };
    if (config.key !== null) headers["x-api-key"] = config.key;
    return {
      url: endpointUrl(config.baseUrl, "/messages"),
      init: {
        method: "POST",
        headers,
        body: JSON.stringify({ model: config.model, max_tokens: 1, messages: [{ role: "user", content: ONE_WORD_PROMPT }] }),
      },
    };
  }

  const headers = { "content-type": "application/json" };
  if (config.key !== null) headers.Authorization = `Bearer ${config.key}`;
  return {
    url: endpointUrl(config.baseUrl, "/chat/completions"),
    init: {
      method: "POST",
      headers,
      body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: ONE_WORD_PROMPT }], max_tokens: 1 }),
    },
  };
}

async function responseMessage(response) {
  try {
    const body = await response.json();
    return body?.error?.message ?? body?.message ?? `Endpoint returned HTTP ${response.status}.`;
  } catch {
    return `Endpoint returned HTTP ${response.status}.`;
  }
}

function driverRequest(config, prompt, signal) {
  if (config.kind === "anthropic") {
    const headers = { "content-type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" };
    if (config.key !== null) headers["x-api-key"] = config.key;
    return { url: endpointUrl(config.baseUrl, "/messages"), init: { method: "POST", headers, signal,
      body: JSON.stringify({ model: config.model, max_tokens: DRIVER_MAX_TOKENS, messages: [{ role: "user", content: prompt }] }) } };
  }
  const headers = { "content-type": "application/json" };
  if (config.key !== null) headers.Authorization = `Bearer ${config.key}`;
  return { url: endpointUrl(config.baseUrl, "/chat/completions"), init: { method: "POST", headers, signal,
    body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: prompt }] }) } };
}

function usageOf(usage, kind) {
  if (!usage) return null;
  const inputTokens = usage.prompt_tokens ?? usage.input_tokens ?? null;
  const outputTokens = usage.completion_tokens ?? usage.output_tokens ?? null;
  if (inputTokens === null && outputTokens === null) return null;
  return { inputTokens, outputTokens, minutes: null, cost: null };
}

function answerOf(body, kind) {
  return kind === "anthropic" ? body?.content?.find((part) => part.type === "text")?.text : body?.choices?.[0]?.message?.content;
}

// endpointDriver(config, participant) -> Driver — one direct exchange for a prepared job prompt; no route selection,
// retries, input cutting, or part duplication belongs here.
export function endpointDriver(config, participant) {
  return { participant, async send(input, options = {}) {
    const where = typeof window === "undefined" ? "node" : "browser";
    const { url, init } = driverRequest(config, input.prompt, options.signal);
    let response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      throw new EndpointFailed(diagnoseEndpoint(error, config, where));
    }
    if (!response.ok) {
      const message = await responseMessage(response);
      throw new EndpointFailed(diagnoseEndpoint({ status: response.status, message }, config, where));
    }
    const body = await response.json();
    return { text: answerOf(body, config.kind), usage: usageOf(body?.usage, config.kind) };
  } };
}

// testEndpoint(config: EndpointConfig) -> Promise<{ works: true, model: string } | { works: false, diagnosis: Diagnosis }>
// It changes no setting and retries nothing: one invocation constructs exactly one fetch request.
export async function testEndpoint(config) {
  const { url, init } = requestFor(config);
  const where = typeof window === "undefined" ? "node" : "browser";
  try {
    const response = await fetch(url, init);
    if (response.ok) return { works: true, model: config.model };
    const message = await responseMessage(response);
    return { works: false, diagnosis: diagnoseEndpoint({ status: response.status, message }, config, where) };
  } catch (error) {
    return { works: false, diagnosis: diagnoseEndpoint(error, config, where) };
  }
}

// diagnoseEndpoint(error, config, where) -> Diagnosis — preserve provider/browser wording where it exists. Browser fetch
// failures deliberately remain generic unless their observable message identifies CORS or the direct-browser opt-in.
export function diagnoseEndpoint(error, config, where) {
  const status = Number(error?.status ?? error?.response?.status);
  const message = String(error?.message ?? error ?? "Endpoint request failed.");
  if (status === 401 || status === 403) return { reason: "key refused", message, routes: [] };
  if (status === 404) return { reason: "model unknown", message, routes: [] };
  if (status === 413 || /too (large|long)|maximum context|context length/i.test(message)) return { reason: "too long", message, routes: [] };
  if (status === 429 || /rate limit/i.test(message)) return { reason: "rate limited", message, routes: [] };
  if (Number.isFinite(status)) return { reason: "endpoint error", message, routes: [] };

  if (where === "browser") {
    const routes = ["ci", "bridge"];
    if (/anthropic-dangerous-direct-browser-access|opt.?in.*header|header.*opt.?in/i.test(message)) {
      return { reason: "opt-in header missing", message, routes };
    }
    if (/cors|cross.origin|access-control-allow-origin/i.test(message)) {
      return { reason: "cross-origin refused", message, routes };
    }
    return { reason: "blocked by the browser", message, routes };
  }

  return { reason: "not reachable", message, routes: [] };
}
