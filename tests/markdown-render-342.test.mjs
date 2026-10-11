// ITM-342 — MOD-markdown-render's Mermaid, front-matter and difference public contract.
//
// Module: MOD-markdown-render
// Guards: DIAGRAMS ARE MERMAID IN MARKDOWN; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW; NO SERVER; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// Level: unit
//
// These cases state the public renderer contract. They leave ITM-220's small-DOM compatibility
// guard unchanged, including its source fallback.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FAULTS = {
  "TST-342001": ["src/markdown-render/mermaid.mjs", "if (!safeSvg(e))", "if (false)"],
  "TST-342002": ["src/markdown-render/render.mjs", 'frontMatter = "table"', 'frontMatter = "hidden"'],
  "TST-342003": ["src/markdown-render/mermaid.mjs", "${esc(source)}", "${source}"],
  "TST-342004": ["src/markdown-render/difference.mjs", 'added: "dadd"', 'added: "dctx"'],
  "TST-342005": ["src/markdown-render/render.mjs", "return rendered;", "renderMermaid('flowchart LR\\nEager-->Load'); return rendered;"],
};

// The established renderer battery owns the browser-compatible small DOM. Loading it here puts
// that real controlled DOM in this test process before the same public module is loaded; no test
// helper is altered or duplicated.
await import("./markdown-render.test.mjs");
const { renderArtifact, renderMermaid, showDifference } = await import("../src/markdown-render/index.mjs");
async function withSvg(run) {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "SVGElement");
  const proto = globalThis.window.Element.prototype;
  const namespace = Object.getOwnPropertyDescriptor(proto, "namespaceURI");
  const tags = proto.getElementsByTagName;
  Object.defineProperty(globalThis, "SVGElement", { configurable: true, value: globalThis.window.Element });
  Object.defineProperty(proto, "namespaceURI", { configurable: true, get() {
    for (let node = this; node; node = node.parentNode) if (node.localName === "svg") return "http://www.w3.org/2000/svg";
    return namespace.get.call(this);
  } });
  proto.getElementsByTagName = function(name) {
    if (name !== "*") return tags.call(this, name);
    const out = []; (function walk(node) { for (const child of node.children ?? []) { out.push(child); walk(child); } })(this); return out;
  };
  try { return await run(); } finally {
    if (prior) Object.defineProperty(globalThis, "SVGElement", prior); else delete globalThis.SVGElement;
    Object.defineProperty(proto, "namespaceURI", namespace); proto.getElementsByTagName = tags;
  }
}

// The existing dashboard caller uses the browser-loaded global library's initialize/run boundary.
// This is the library boundary only: the returned SVG is constructed by the stand-in as a browser
// diagram library would, then the public module must retain strict initialisation and sanitise it.
const SAFE_SVG = '<svg><style>.node:not(.hidden){font-family:var(--mermaid-font-family);fill:rgb(1,2,3);marker-end:url(#one)}</style><script>fetch("https://outside.example")</script><rect onload="alert(1)"></rect><text>drawn</text><path marker-start="url(#one)" marker-mid="url(\'#two\')" marker-end="url(&quot;#three&quot;)"></path></svg>';
function installMermaid(svg = SAFE_SVG) {
  const calls = [];
  globalThis.mermaid = {
    initialize(options) { calls.push({ kind: "initialize", options }); },
    async run({ nodes }) {
      calls.push({ kind: "run", nodes: [...nodes] });
      for (const node of nodes) {
        if (node.textContent.includes("this is not Mermaid")) throw new Error("parse error: expected diagram type");
        node.innerHTML = svg;
      }
    },
  };
  return calls;
}

// TST-342001
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW; NO SERVER
// given: a public Markdown renderer with a Mermaid source block and prose beside it
// input: renderMermaid("flowchart LR\\n  Plan --> Build")
// expect: a promise for one sanitised strict-rendered diagram element; a parser failure instead has its message beside the
//         unchanged Mermaid source, so surrounding prose remains renderable
test("TST-342001 renderMermaid draws strict SVG and leaves no hostile diagram markup", async () => withSvg(async () => {
  const calls = installMermaid();
  const drawn = await renderMermaid("flowchart LR\n  Plan --> Build");
  assert.equal(drawn.nodeType, 1);
  assert.match(drawn.innerHTML, /<svg\b/i, "the Mermaid source is drawn as SVG");
  assert.equal(calls[0].options.startOnLoad, false, "the library does not draw on load");
  assert.equal(calls[0].options.securityLevel, "strict", "the external diagram library is initialised at strict security");
  assert.equal(calls.filter((call) => call.kind === "run").length, 1, "the library drew the supplied diagram");
  assert.match(SAFE_SVG, /<script\b|\son\w+=|https:\/\/outside\.example/i, "known positive: the library-boundary SVG is hostile");
  assert.doesNotMatch(drawn.innerHTML, /<script\b|\son\w+=|https:\/\/outside\.example/i,
    "hostile SVG content never reaches the page");
  assert.match(drawn.innerHTML, /<text>drawn<\/text>|drawn/, "readable SVG label is retained");
  assert.match(drawn.innerHTML, /var\(--mermaid-font-family\)|rgb\(1,2,3\)/);
  const path = drawn.getElementsByTagName("path")[0];
  assert.equal(path.getAttribute("marker-start"), "url(#one)");
  assert.equal(path.getAttribute("marker-mid"), "url('#two')");
  assert.equal(path.getAttribute("marker-end"), 'url("#three")');
  for (const css of ['url(../outside.svg)', 'url(\\#escaped)', 'image(url(#one))', 'image-set(url(#one) 1x)']) {
    installMermaid(`<svg><style>.node{fill:${css}}</style><text>drawn</text></svg>`);
    const refused = await renderMermaid("flowchart LR\n  Unsafe --> Resource");
    assert.equal(refused.className, "unrendered", css);
    assert.match(refused.textContent, /external resource|Diagram error/i, css);
  }
}));

// TST-342002
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW
// given: an artifact with two Mermaid blocks, prose before, between and after them, and front matter
// input: renderArtifact(text) and renderArtifact(text, { frontMatter: "hidden" })
// expect: every Mermaid block is sent to the diagram renderer; default output includes front-matter keys and values as a
//         table, while hidden output omits that table and retains all prose and diagram sources/results
test("TST-342002 renderArtifact renders every Mermaid block and makes front matter table-or-hidden", async () => withSvg(async () => {
  installMermaid();
  const text = [
    "---", "id: UC-999", "actors:", "  - Reviewer", "---", "Before.", "", "```mermaid", "flowchart LR", "  A --> B", "```",
    "", "Between.", "", "```mermaid", "flowchart LR", "  B --> C", "```", "", "After.", "",
  ].join("\n");
  const shown = renderArtifact(text);
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(shown.innerHTML, /<table\b[\s\S]*?<th>id<\/th>[\s\S]*?<td>UC-999<\/td>/,
    "front matter is a readable table by default");
  assert.equal((shown.innerHTML.match(/<svg\b/gi) ?? []).length, 2, "every Mermaid block is drawn");
  for (const prose of ["Before.", "Between.", "After."]) assert.match(shown.textContent, new RegExp(prose));

  const hidden = renderArtifact(text, { frontMatter: "hidden" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.doesNotMatch(hidden.innerHTML, /<th>id<\/th>|UC-999/, "hidden front matter is not rendered");
  assert.equal((hidden.innerHTML.match(/<svg\b/gi) ?? []).length, 2, "hiding front matter changes no diagram");
}));

// TST-342003
// guards: NO SERVER; DIAGRAMS ARE MERMAID IN MARKDOWN
// given: source "this is not Mermaid\\n<script>alert(1)</script>", which the library-boundary parser rejects
// input: renderMermaid(source)
// expect: its parser reason is shown beside the escaped source; no script element reaches the page
test("TST-342003 a Mermaid parse failure shows its message beside the escaped source", async () => withSvg(async () => {
  installMermaid();
  const source = "this is not Mermaid\n<script>alert(1)</script>";
  assert.match(source, /<script\b/i, "known positive: rejected source contains script markup");
  const shown = await renderMermaid(source);
  assert.match(shown.textContent, /this is not Mermaid/, "the source is shown for correction");
  assert.match(shown.textContent, /error|parse|syntax/i, "the parser's reason is beside its source");
  assert.doesNotMatch(shown.innerHTML, /<script\b/i, "the source is escaped rather than inserted as HTML");
}));

// TST-342005
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN; NO SERVER
// given: an artifact with Markdown prose and no Mermaid fence
// input: renderArtifact(text)
// expect: a diagram first acquires the local vendor script and records a draw; after that detector is cleared, prose renders
//         without another acquisition, initialisation or draw
test("TST-342005 an artifact without a diagram loads no diagram library", async () => withSvg(async () => {
  const priorMermaid = Object.getOwnPropertyDescriptor(globalThis, "mermaid");
  delete globalThis.mermaid;
  const body = document.body;
  for (const script of document.getElementsByTagName("script")) script.remove();
  const appendChild = body.appendChild;
  const acquired = [];
  let calls;
  body.appendChild = function appendVendorScript(node) {
    acquired.push(node);
    const result = appendChild.call(this, node);
    if (node.getAttribute("src")?.includes("mermaid.min.js")) {
      calls = installMermaid();
      node.dispatchEvent(new Event("load"));
    }
    return result;
  };
  try {
    await renderMermaid("flowchart LR\n  Vendor --> Loaded");
    assert.equal(acquired.length, 1, "a Mermaid block acquires exactly one local library script");
    assert.match(acquired[0].getAttribute("src"), /vendor\/mermaid\.min\.js$/, "the acquired script is the vendored library");
    assert.equal(calls.filter((call) => call.kind === "run").length, 1, "known positive: the detector records a diagram draw");
    calls.length = 0;
    const shown = renderArtifact("# Prose only\n");
    assert.match(shown.innerHTML, /<h1>Prose only<\/h1>/);
    assert.deepEqual(calls, [], "plain prose neither acquires nor calls the diagram library");
    assert.equal(acquired.length, 1, "plain prose does not append a vendor script");
  } finally {
    body.appendChild = appendChild;
    if (priorMermaid) Object.defineProperty(globalThis, "mermaid", priorMermaid);
    else delete globalThis.mermaid;
  }
}));

// TST-342004
// guards: NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: before "one\\ntwo\\nthree\\nfour\\n" and after "one\\nTWO\\nthree\\nfour\\n", with context 1
// input: showDifference(before, after, { context: 1 })
// expect: an Element whose changed rows are marked removed and added and whose unchanged rows contain one line around the
//         change; unchanged lines outside that context are omitted
test("TST-342004 showDifference marks a changed line and retains its requested context", () => {
  const shown = showDifference("one\ntwo\nthree\nfour\n", "one\nTWO\nthree\nfour\n", { context: 1 });
  assert.equal(shown.className, "diff");
  assert.deepEqual(shown.children.map((row) => [row.className, row.textContent]), [
    ["dctx", "  one"],
    ["dadd", "+ TWO"],
    ["ddel", "- two"],
    ["dctx", "  three"],
  ]);
});

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_342_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-342-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [file, needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, file), original = readFileSync(source), count = original.toString().split(needle).length - 1;
      assert.equal(count, 1, `${id}: unique fault target`);
      const digest = (value) => createHash("sha256").update(value).digest("hex");
      const invoke = () => { const env = { ...process.env, AGENT_M_342_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT;
        return spawnSync(process.execPath, ["--test", "--test-name-pattern", id, "tests/markdown-render-342.test.mjs"], { cwd: copied, encoding: "utf8", timeout: 15_000, env }); };
      const originalHash = digest(original), testHash = digest(readFileSync(join(copied, "tests/markdown-render-342.test.mjs")));
      let faultHash, failed, faultEnded, restoreStarted, restoredHash, passed, restoredEnded;
      const faultStarted = new Date().toISOString();
      try {
        writeFileSync(source, original.toString().replace(needle, replacement));
        faultHash = digest(readFileSync(source));
        failed = invoke();
        faultEnded = new Date().toISOString();
      } finally {
        restoreStarted = new Date().toISOString();
        writeFileSync(source, original);
        restoredHash = digest(readFileSync(source));
        restoredEnded = new Date().toISOString();
      }
      passed = invoke();
      console.log("TST342-counterproof " + JSON.stringify({ id, file, needle, replacement, testHash, originalHash, faultHash, restoredHash, faultStarted, faultEnded, restoreStarted, restoredEnded, argv: [process.execPath, "--test", "--test-name-pattern", id, "tests/markdown-render-342.test.mjs"], cwd: copied, childflag: "AGENT_M_342_FAULT_CHILD=1",
        failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr } }));
      assert.equal(failed.status, 1, id); assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`));
      assert.equal(restoredHash, originalHash, `${id}: exact restoration`); assert.equal(passed.status, 0, id);
      assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
