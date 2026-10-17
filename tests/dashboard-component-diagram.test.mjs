// The architecture page of the live dashboard (#arc) draws the component diagram of the modules (UC-025 step 5): one box for each module
// file inside the box of its subsystem, one arrow from a module to each module it uses, a used module without a file as a box marked
// missing, and a folded explanation of what the diagram draws. The page of one file (#arc/<id>) draws none. The diagram is Mermaid in
// Markdown (DIAGRAMS ARE MERMAID IN MARKDOWN), handed to MOD-markdown-render, which the harness's page stands for.
// Run: node --test tests/dashboard-component-diagram.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-025; DIAGRAMS ARE MERMAID IN MARKDOWN; A MODULE BELONGS TO ONE SUBSYSTEM; THE TRACEABILITY MATRIX IS DERIVED
// Level: component

import assert from "node:assert/strict";
import test from "node:test";
import { openDashboard, repoServer } from "./app-harness.mjs";

const SPEC = "# Fixture\n\n## Rules\n\n**A RULE** *(Source)*\nA rule.\n*Check:* `tests/rule.test.mjs`\n";
const decision = (id) => `---\nid: ${id}\ntitle: The ${id} subsystem\nforced_by:\n  - A RULE\n---\n# ${id} The ${id} subsystem\n\n## Context\n\nc\n\n## Decision\n\nd\n\n## Alternatives\n\na\n\n## Consequences\n\nq\n`;
const module_ = (id, title, uses) => `---\nid: ${id}\ntitle: ${title}\nfolder: src/${id}/\nrealises:\n  - A RULE\nfollows:\n  - ARC-001\nuses:\n${uses.map((u) => `  - ${u}`).join("\n")}\nprovides:\n  - go\n---\n# ${id} ${title}\n\n## Responsibility\n\nr\n\n## Parts\n\np\n\n## Data\n\nd\n\n## Interfaces\n\n- \`go\`\n\n## Files\n\nf\n\n## Uses\n\nu\n`;

const FILES = {
  "README.md": "# Fixture\n", "SPEC.md": SPEC,
  "docs/architecture/ARC-001-whole.md": decision("ARC-001"),
  "docs/architecture/MOD-reader.md": module_("MOD-reader", "Reading", ["MOD-writer.go", "MOD-ghost.go"]),
  "docs/architecture/MOD-writer.md": module_("MOD-writer", "Writing", []),
};

// Mermaid as a recorder: the text of every diagram the page hands it (MOD-markdown-render's renderMermaid runs the library on a node holding it).
function recorder() {
  const drawn = { texts: [] };
  globalThis.mermaid = {
    initialize() {},
    mermaidAPI: { getDiagramFromText: async () => ({ db: { getVertices: () => ({}) } }) },
    run: async ({ nodes }) => { drawn.texts.push(...nodes.map((node) => node.textContent)); },
  };
  return drawn;
}

// TST-680210 · level: component · module: MOD-site-frame
// guards: UC-025; A MODULE BELONGS TO ONE SUBSYSTEM; DIAGRAMS ARE MERMAID IN MARKDOWN
// given: ARC-001 and two module files that follow it, MOD-reader using MOD-writer and MOD-ghost, which has no file
// input: the dashboard opened at #arc, with a token; and at #arc/MOD-reader
// expect: the list page hands Mermaid one diagram, with a box for each of the two module files inside ARC-001's box, the arrow from MOD-reader to MOD-writer and MOD-ghost marked missing, and folds an explanation of what it draws under it; the page of one file draws none
test("#arc draws the component diagram of the modules; the page of one module file does not", async () => {
  const drawn = recorder();
  try {
    const page = await openDashboard({ server: await repoServer({ files: FILES }), hash: "#arc" });
    const main = page.main();
    assert.equal(drawn.texts.length, 1, "one Mermaid diagram");
    const diagram = drawn.texts[0];
    assert.match(diagram, /subgraph S_ARC_001/, "the subsystem's box");
    assert.match(diagram, /MOD_reader\["MOD-reader<br\/>Reading"\]/, "a box for MOD-reader");
    assert.match(diagram, /MOD_writer\["MOD-writer<br\/>Writing"\]/, "a box for MOD-writer");
    assert.match(diagram, /MOD_reader --> MOD_writer/, "one arrow from the user to the module it uses");
    assert.match(diagram, /MOD_ghost\["MOD-ghost — missing"\]/, "the used module without a file is a box marked missing");
    assert.match(main, /class="mermaid"[^]*<details class="explain"><summary>What is this\?<\/summary>[^]*one box[^]*per module/i, "the folded explanation under the diagram");
    drawn.texts.length = 0;
    const one = await openDashboard({ server: await repoServer({ files: FILES }), hash: "#arc/MOD-reader" });
    assert.equal(drawn.texts.length, 0, "the page of one file draws none");
    assert.equal(one.main().includes("class=\"mermaid\""), false);
  } finally {
    delete globalThis.mermaid;
  }
});
