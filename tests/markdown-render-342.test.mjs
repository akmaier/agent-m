// ITM-342 — MOD-markdown-render's Mermaid, front-matter and difference public contract.
//
// Module: MOD-markdown-render
// Level: unit
//
// These cases state the public renderer contract. They leave ITM-220's small-DOM compatibility
// guard unchanged, including its source fallback.

import test from "node:test";
import assert from "node:assert/strict";

// The established renderer battery owns the browser-compatible small DOM. Loading it here puts
// that real controlled DOM in this test process before the same public module is loaded; no test
// helper is altered or duplicated.
await import("./markdown-render.test.mjs");
const { renderArtifact, renderMermaid, showDifference } = await import("../src/markdown-render/index.mjs");

// The existing dashboard caller uses the browser-loaded global library's initialize/run boundary.
// This is the library boundary only: the returned SVG is constructed by the stand-in as a browser
// diagram library would, then the public module must retain strict initialisation and sanitise it.
function installMermaid() {
  const calls = [];
  globalThis.mermaid = {
    initialize(options) { calls.push({ kind: "initialize", options }); },
    async run({ nodes }) {
      calls.push({ kind: "run", nodes: [...nodes] });
      for (const node of nodes) {
        if (node.textContent.includes("this is not Mermaid")) throw new Error("parse error: expected diagram type");
        node.innerHTML = '<svg><script>fetch("https://outside.example")</script><rect onload="alert(1)"></rect><text>drawn</text></svg>';
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
test("TST-342001 renderMermaid draws strict SVG and leaves no hostile diagram markup", async () => {
  const calls = installMermaid();
  const drawn = await renderMermaid("flowchart LR\n  Plan --> Build");
  assert.equal(drawn.nodeType, 1);
  assert.match(drawn.innerHTML, /<svg\b/i, "the Mermaid source is drawn as SVG");
  assert.equal(calls[0].options.startOnLoad, false, "the library does not draw on load");
  assert.equal(calls[0].options.securityLevel, "strict", "the external diagram library is initialised at strict security");
  assert.equal(calls.filter((call) => call.kind === "run").length, 1, "the library drew the supplied diagram");
  const injected = '<svg><script>fetch("https://outside.example")</script><rect onload="alert(1)"></rect></svg>';
  assert.match(injected, /<script\b|\son\w+=|https:\/\/outside\.example/i, "known positive: the library-boundary SVG is hostile");
  assert.doesNotMatch(drawn.innerHTML, /<script\b|\son\w+=|https:\/\/outside\.example/i,
    "hostile SVG content never reaches the page");
});

// TST-342002
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW
// given: an artifact with two Mermaid blocks, prose before, between and after them, and front matter
// input: renderArtifact(text) and renderArtifact(text, { frontMatter: "hidden" })
// expect: every Mermaid block is sent to the diagram renderer; default output includes front-matter keys and values as a
//         table, while hidden output omits that table and retains all prose and diagram sources/results
test("TST-342002 renderArtifact renders every Mermaid block and makes front matter table-or-hidden", async () => {
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
});

// TST-342003
// guards: NO SERVER; DIAGRAMS ARE MERMAID IN MARKDOWN
// given: source "this is not Mermaid\\n<script>alert(1)</script>", which the library-boundary parser rejects
// input: renderMermaid(source)
// expect: its parser reason is shown beside the escaped source; no script element reaches the page
test("TST-342003 a Mermaid parse failure shows its message beside the escaped source", async () => {
  installMermaid();
  const source = "this is not Mermaid\n<script>alert(1)</script>";
  const shown = await renderMermaid(source);
  assert.match(shown.textContent, /this is not Mermaid/, "the source is shown for correction");
  assert.match(shown.textContent, /error|parse|syntax/i, "the parser's reason is beside its source");
  assert.doesNotMatch(shown.innerHTML, /<script\b/i, "the source is escaped rather than inserted as HTML");
});

// TST-342005
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN; NO SERVER
// given: an artifact with Markdown prose and no Mermaid fence
// input: renderArtifact(text)
// expect: the prose is rendered and no Mermaid initialize or run call occurs
test("TST-342005 an artifact without a diagram loads no diagram library", () => {
  const calls = installMermaid();
  const shown = renderArtifact("# Prose only\\n");
  assert.match(shown.innerHTML, /<h1>Prose only<\/h1>/);
  assert.deepEqual(calls, [], "known positive: a diagram library would have recorded initialize/run calls");
});

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
