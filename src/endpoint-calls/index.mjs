// MOD-endpoint-calls — direct endpoint tests, diagnoses, and model drivers for browser and Node callers.

import { driverPrompt } from "../job-runner/index.mjs";

/**
 * @typedef {{ name: string, kind: "openai-compatible" | "anthropic", baseUrl: string, model: string, key: string | null }} EndpointConfig
 */

/**
 * @typedef {{ reason: "cross-origin refused" | "opt-in header missing" | "blocked by the browser" | "not reachable" | "key refused" | "model unknown" | "too long" | "rate limited" | "endpoint error", message: string, routes: ("ci" | "bridge")[] }} Diagnosis
 */

const PROBE_PROMPT = "Call agent_m_probe once. It is a harmless capability check.";
const PROBE_TOOL = {
  name: "agent_m_probe",
  description: "Report that tool calling works without changing anything.",
  input: { type: "object", properties: {}, additionalProperties: false },
};
const DRIVER_MAX_TOKENS = 1024;

class EndpointFailed extends Error {
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
  return providerRequest(config, PROBE_PROMPT, { maxTokens: 64, tools: [PROBE_TOOL] });
}

function openaiMessages(messages) {
  return messages.map((message) => {
    const result = { role: message.role, content: message.text };
    if (message.role === "tool") result.tool_call_id = message.callId;
    if (message.calls?.length) result.tool_calls = message.calls.map((call) => ({
      id: call.id, type: "function", function: { name: call.name, arguments: JSON.stringify(call.args) },
    }));
    return result;
  });
}

function anthropicMessages(messages) {
  const result = [];
  for (const message of messages) {
    if (message.role === "assistant") {
      const content = [];
      if (message.text) content.push({ type: "text", text: message.text });
      for (const call of message.calls ?? []) content.push({ type: "tool_use", id: call.id, name: call.name, input: call.args });
      result.push({ role: "assistant", content: message.calls?.length ? content : message.text });
      continue;
    }
    const content = message.role === "tool"
      ? { type: "tool_result", tool_use_id: message.callId, content: message.text }
      : { type: "text", text: message.text };
    const previous = result.at(-1);
    // Anthropic receives consecutive tool results and user text in one user turn.
    if (previous?.role === "user") {
      if (typeof previous.content === "string") previous.content = [{ type: "text", text: previous.content }];
      previous.content.push(content);
    } else result.push({ role: "user", content: message.role === "tool" ? [content] : message.text });
  }
  return result;
}

function providerRequest(config, prompt, { maxTokens = config.kind === "anthropic" ? DRIVER_MAX_TOKENS : null, signal, messages, tools = [] } = {}) {
  if (config.kind === "anthropic") {
    const headers = {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    };
    if (config.key !== null) headers["x-api-key"] = config.key;
    const body = { model: config.model, max_tokens: maxTokens,
      messages: messages ? anthropicMessages(messages) : [{ role: "user", content: prompt }] };
    if (tools.length) body.tools = tools.map((tool) => ({ name: tool.name, description: tool.description, input_schema: tool.input }));
    return {
      url: endpointUrl(config.baseUrl, "/messages"),
      init: { method: "POST", headers, signal,
        body: JSON.stringify(body) },
    };
  }

  const headers = { "content-type": "application/json" };
  if (config.key !== null) headers.Authorization = `Bearer ${config.key}`;
  const history = messages ? openaiMessages(messages) : [{ role: "user", content: prompt }];
  const body = maxTokens === null ? { model: config.model, messages: history } : { model: config.model, messages: history, max_tokens: maxTokens };
  if (tools.length) body.tools = tools.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: tool.input } }));
  return {
    url: endpointUrl(config.baseUrl, "/chat/completions"),
    init: { method: "POST", headers, signal,
      body: JSON.stringify(body) },
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
  return providerRequest(config, prompt, { signal });
}

function usageOf(usage) {
  if (!usage) return null;
  const inputTokens = usage.prompt_tokens ?? usage.input_tokens ?? null;
  const outputTokens = usage.completion_tokens ?? usage.output_tokens ?? null;
  if (inputTokens === null && outputTokens === null) return null;
  return { inputTokens, outputTokens, minutes: null, cost: null };
}

function answerOf(body, kind) {
  return kind === "anthropic" ? body?.content?.find((part) => part.type === "text")?.text : body?.choices?.[0]?.message?.content;
}

function exchangeAnswer(body, kind) {
  const calls = kind === "anthropic"
    ? (body?.content ?? []).filter((part) => part.type === "tool_use").map((part) => ({ id: part.id, name: part.name, args: part.input }))
    : (body?.choices?.[0]?.message?.tool_calls ?? []).map((call) => ({ id: call.id, name: call.function.name, args: JSON.parse(call.function.arguments) }));
  const text = kind === "anthropic"
    ? (body?.content ?? []).filter((part) => part.type === "text").map((part) => part.text).join("")
    : body?.choices?.[0]?.message?.content ?? "";
  return { text, calls, usage: usageOf(body?.usage) };
}

// One provider request: return calls to the caller without executing or following them.
export async function endpointExchange(config, exchange) {
  const where = typeof window === "undefined" ? "node" : "browser";
  const request = providerRequest(config, null, { messages: exchange.messages, tools: exchange.tools });
  const response = await endpointResponse(config, request, where);
  if (!response.ok) {
    const message = await responseMessage(response);
    const diagnosis = diagnoseEndpoint({ status: response.status, message }, config, where);
    throw new EndpointFailed(diagnosis);
  }
  try {
    return exchangeAnswer(await response.json(), config.kind);
  } catch (error) {
    throw new EndpointFailed(diagnoseEndpoint({ status: response.status, message: error.message }, config, where));
  }
}

// endpointDriver(config, participant) -> Driver — one direct exchange for a prepared job prompt; no route selection,
// retries, input cutting, or part duplication belongs here.
export function endpointDriver(config, participant) {
  return { participant, async send(input, options = {}) {
    const where = typeof window === "undefined" ? "node" : "browser";
    const { url, init } = driverRequest(config, driverPrompt(input), options.signal);
    const response = await endpointResponse(config, { url, init }, where);
    if (!response.ok) {
      const message = await responseMessage(response);
      throw new EndpointFailed(diagnoseEndpoint({ status: response.status, message }, config, where));
    }
    const body = await response.json();
    return { text: answerOf(body, config.kind), usage: usageOf(body?.usage) };
  } };
}

// The probe observes a harmless proposed call; it never carries that call out.
// It changes no setting and retries nothing: one invocation constructs exactly one fetch request.
export async function testEndpoint(config) {
  const { url, init } = requestFor(config);
  const where = typeof window === "undefined" ? "node" : "browser";
  try {
    const response = await endpointResponse(config, { url, init }, where);
    if (response.ok) {
      const answer = exchangeAnswer(await response.json(), config.kind);
      const tools = answer.calls.some((call) => call.name === PROBE_TOOL.name);
      return { works: true, model: config.model, tools, toolMessage: tools ? null : answer.text || null };
    }
    const message = await responseMessage(response);
    const toolRefusal = [400, 422, 501].includes(response.status)
      && /(?:tools?|function calling).*(?:not support|unsupported|not allowed)|(?:not support|unsupported).*(?:tools?|function calling)/i.test(message);
    if (toolRefusal) return { works: true, model: config.model, tools: false, toolMessage: message };
    return { works: false, diagnosis: diagnoseEndpoint({ status: response.status, message }, config, where) };
  } catch (error) {
    return { works: false, diagnosis: error.diagnosis ?? diagnoseEndpoint(error, config, where) };
  }
}

async function endpointResponse(config, { url, init }, where) {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new EndpointFailed(diagnoseEndpoint(error, config, where));
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
