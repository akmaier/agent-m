// The site as a browser meets it, served for tests/site-usability.test.mjs: this repository's own files — the two entry pages (the
// main page at `/` and the review pages at `/docs/`), their scripts, style sheets and logos — and, beside them, a fake GitHub that
// answers every request the pages send to api.github.com and raw.githubusercontent.com from the files of a fixture product
// (tests/app-harness.mjs' repoServer). Before the page's own scripts run, the fixture's GitHub token is stored in the page's
// localStorage and the page's fetch is pointed at the fake, so that nothing leaves this machine. It is test code; it holds no expected
// result.
//
// Module: MOD-site-frame
// Level: system

import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { join, normalize } from "node:path";
import { REPO, TOKEN, repoServer } from "../app-harness.mjs";

const root = new URL("../..", import.meta.url).pathname;

// In the browser, before the page's scripts: the token is stored, and every request to GitHub goes to this server's fake.
function browserSide(token) {
  // The instance's GitHub token, as MOD-browser-store keeps it: under the prefix of the upstream instance, which a page served
  // from a host other than GitHub Pages names (MOD-site-frame instanceOf).
  localStorage.setItem("agent-m:akmaier/agent-m:github-token",
    JSON.stringify({ value: token, name: "Agent M · akmaier/agent-m", expires: null, stored: new Date().toISOString().slice(0, 10) }));
  const nativeFetch = window.fetch.bind(window);
  window.__pending = 0;
  window.fetch = (input, init = {}) => {
    const url = String(input?.url ?? input);
    if (!/^https:\/\/(api\.github\.com|raw\.githubusercontent\.com)\//.test(url)) return nativeFetch(input, init);
    window.__pending += 1;
    return nativeFetch("/__github", { method: "POST", body: JSON.stringify({ url, method: init.method ?? "GET", body: init.body ?? null }) })
      .finally(() => { window.__pending -= 1; });
  };
}

const TYPES = { ".mjs": "text/javascript", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".html": "text/html", ".md": "text/markdown" };

// serveSite({ files, history, handlers }) -> Promise<{ address, repository, close }> — `address` is the origin of the served site, `repository`
// the fake repository of tests/app-harness.mjs (its `requests` list every request the pages sent).
export async function serveSite({ files, history = [], handlers = [] }) {
  const repository = await repoServer({ files, history, handlers });
  const server = createServer(async (request, response) => {
    const raw = decodeURIComponent(new URL(request.url, "http://site").pathname);
    if (raw === "/__github" && request.method === "POST") {
      let text = "";
      for await (const chunk of request) text += chunk;
      const { url, method, body } = JSON.parse(text);
      const answer = await repository.fetch(url, body === null ? { method } : { method, body });
      response.writeHead(answer.status, Object.fromEntries(answer.headers));
      response.end(Buffer.from(await answer.arrayBuffer()));
      return;
    }
    if (raw === "/__blank") { response.writeHead(200, { "content-type": "text/html" }); response.end("<!doctype html><title>blank</title>"); return; }
    const relative = raw === "/" ? "index.html" : raw === "/docs/" ? "docs/index.html" : raw.replace(/^\//, "");
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    if (relative === "index.html" || relative === "docs/index.html") {
      response.setHeader("content-type", "text/html");
      response.end(readFileSync(file, "utf8").replace("<head>", `<head><script>(${browserSide})(${JSON.stringify(TOKEN)});</script>`));
      return;
    }
    const extension = relative.slice(relative.lastIndexOf("."));
    response.writeHead(200, { "content-type": TYPES[extension] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { address: `http://127.0.0.1:${server.address().port}`, repository, close: () => new Promise((resolve) => server.close(resolve)) };
}

export { REPO };
