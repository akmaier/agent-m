// keys.mjs — an endpoint's key on a request (MOD-endpoint-calls, Parts): the header that carries it, by the endpoint's kind, and the key holder, which adds it to each
// request it forwards to its endpoint, so that the program whose requests it forwards holds no key.
//
// Module: MOD-endpoint-calls
//
// NO MODEL READS A CREDENTIAL. The key holder runs in Node only, where it is started: Node's own modules are taken when it starts, so that a browser that loads this file
// with the rest of the module meets none of them.

/**
 * keyHeaders(kind: "openai-compatible" | "anthropic", key: string | null) -> Record<string, string> — the header that carries the key on a request to an endpoint of
 * that kind: `x-api-key` on Anthropic, `Authorization: Bearer <key>` on an OpenAI-compatible endpoint; none without a key.
 */
export function keyHeaders(kind, key) {
  if (key === null || key === undefined) return {};
  return kind === "anthropic" ? { "x-api-key": key } : { Authorization: `Bearer ${key}` };
}

// The headers a forwarded request does not take over from its caller: those of the connection, those fetch sets itself, and every header that carries a key.
const NOT_FORWARDED = new Set(["host", "connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-connection", "te", "trailer", "content-length",
  "accept-encoding", "authorization", "x-api-key"]);
// The headers an answer does not take over: fetch has already decoded the body and measures it anew.
const NOT_ANSWERED = new Set(["connection", "keep-alive", "transfer-encoding", "content-encoding", "content-length"]);

/**
 * holdKey({ kind, baseUrl, key }: { kind: "openai-compatible" | "anthropic", baseUrl: string, key: string | null }) -> Promise<{ address: string, close() ->
 * Promise<void> }> — a server on 127.0.0.1 at a free port, `address` being `http://127.0.0.1:<port>`, that forwards each request it receives to the same path below
 * `baseUrl` — the method, the body and the caller's headers, without any header that carries a key — with the key in the header `keyHeaders` gives, and answers with
 * the endpoint's status, headers and body; a redirect is answered, not followed. A request whose target is not a path, or that would leave `baseUrl`'s origin, is
 * answered 400 and sent nowhere; a request the endpoint does not answer is answered 502. The key goes to no other address and into no answer. Node only.
 */
export async function holdKey({ kind, baseUrl, key }) {
  const http = globalThis.process.getBuiltinModule("node:http");
  const base = baseUrl.replace(/\/+$/, "");
  const origin = new URL(base).origin;
  const server = http.createServer(async (request, response) => {
    const answer = (status, text) => { response.writeHead(status, { "content-type": "text/plain" }); response.end(text); };
    const target = request.url.startsWith("/") && !request.url.startsWith("//") ? new URL(`${base}${request.url}`) : null;
    if (!target || target.origin !== origin) return answer(400, "The key holder forwards only a path of its endpoint.");
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const headers = Object.fromEntries(Object.entries(request.headers).filter(([name]) => !NOT_FORWARDED.has(name.toLowerCase())));
    let forwarded;
    try {
      forwarded = await fetch(target, { method: request.method, headers: { ...headers, ...keyHeaders(kind, key) }, redirect: "manual",
        body: ["GET", "HEAD"].includes(request.method) ? undefined : Buffer.concat(chunks) });
    } catch (error) {
      return answer(502, `The endpoint did not answer: ${error?.cause?.code ?? error?.message ?? error}`);
    }
    const body = Buffer.from(await forwarded.arrayBuffer());
    response.writeHead(forwarded.status, Object.fromEntries([...forwarded.headers].filter(([name]) => !NOT_ANSWERED.has(name.toLowerCase()))));
    response.end(body);
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  return {
    address: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); }),
  };
}
