// Independent selected-item release verification for ITM-342 and ITM-343.
// Module: MOD-markdown-render
// Guards: DIAGRAMS ARE MERMAID IN MARKDOWN; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; NO SERVER; EDITS ARE PREPARED ON THE DASHBOARD; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; A REFUSED SAVE KEEPS THE EDIT
// Level: release
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FAULTS = {
  "TST-342008": ["src/markdown-render/render.mjs", 'frontMatter = "table"', 'frontMatter = "hidden"'],
  "TST-342009": ["src/markdown-render/difference.mjs", 'added: "dadd"', 'added: "dctx"'],
  "TST-343005": ["src/markdown-render/editor.mjs", "difference(against, draft)", "difference(draft, against)"],
};
await import("./markdown-render.test.mjs");
const { renderArtifact, renderMermaid, showDifference, openEditor } = await import("../src/markdown-render/index.mjs");
const byTag = (root, tag) => { const out=[]; (function walk(n){ for(const c of n.childNodes ?? []) { if(c.nodeType===1){if(c.localName===tag)out.push(c);walk(c);} } })(root); return out; };
const byClass = (root, name) => { const out=[]; (function walk(n){ for(const c of n.childNodes ?? []) { if(c.nodeType===1){if(c.className.split(" ").includes(name))out.push(c);walk(c);} } })(root); return out; };
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
  const calls = [];
  globalThis.mermaid = { initialize(options) { calls.push(options); }, mermaidAPI: { async getDiagramFromText(source) { if (source.includes("invalid")) throw new Error("parse error"); return { db: { getVertices: () => new Map() } }; } }, async run({nodes}) { for (const n of nodes) n.innerHTML = '<svg><text>drawn</text></svg>'; } };
  try { return await run(calls); } finally { if (prior) Object.defineProperty(globalThis, "SVGElement", prior); else delete globalThis.SVGElement; Object.defineProperty(proto, "namespaceURI", namespace); proto.getElementsByTagName = tags; delete globalThis.mermaid; }
}

// TST-342008
// given: public renderArtifact with front matter, adjacent prose, one drawable Mermaid block and one invalid hostile block
// input: default rendering and { frontMatter: "hidden" }
// expect: table/default and hidden option, prose and strict safe drawing remain; invalid source/reason is escaped
// fault: render.mjs defaults front matter to hidden
// counter-proof: recorded by the GitHub Ubuntu copied-tree child below.
test("TST-342008 public renderer retains prose, table-or-hidden front matter, and safe fallback", async () => withSvg(async (calls) => {
  const text = "---\nid: UC-019\n---\nBefore.\n```mermaid\nflowchart LR\nA-->B\n```\nAfter.\n```mermaid\ninvalid <script>x</script>\n```";
  const shown = renderArtifact(text); await new Promise((r) => setImmediate(r));
  assert.match(shown.innerHTML, /<th>id<\/th>/); assert.match(shown.textContent, /Before\./); assert.match(shown.textContent, /After\./); assert.match(shown.textContent, /drawn/);
  assert.equal(calls[0].securityLevel, "strict"); assert.doesNotMatch(shown.innerHTML, /<script\b/i); assert.match(shown.textContent, /invalid/); assert.match(shown.textContent, /parse error/i);
  const hidden = renderArtifact(text, { frontMatter: "hidden" }); await new Promise((r) => setImmediate(r));
  assert.doesNotMatch(hidden.innerHTML, /<th>id<\/th>/); assert.match(hidden.textContent, /Before\.|After\./);
}));

// TST-342009
// given: public showDifference before/after texts with one replacement and context 1
// input: showDifference(before, after, { context: 1 })
// expect: before→after additions/removals and only adjacent unchanged lines
// fault: difference.mjs renders added rows as context.
test("TST-342009 public difference preserves direction and bounded context", () => {
  const rows = showDifference("one\ntwo\nthree\nfour\n", "one\nTWO\nthree\nfour\n", { context: 1 }).children;
  assert.deepEqual(rows.map((r) => [r.className, r.textContent]), [["dctx", "  one"], ["dadd", "+ TWO"], ["ddel", "- two"], ["dctx", "  three"]]);
});

// TST-343005
// given: public editor with a later compiler finding, a draft against current text, refused save and unsaved close
// input: setMarks, showDraft, Save, close decline/accept and saved-close baseline
// expect: marks/draft/preview/difference and refused text remain; close asks only for unsaved work
// fault: editor.mjs reverses the draft difference.
test("TST-343005 public editor retains marks, draft, refusal and close baselines", async () => {
  const target = document.createElement("div"), prior = Object.getOwnPropertyDescriptor(globalThis, "confirm"), answers = [false, true], asked=[];
  Object.defineProperty(globalThis, "confirm", { configurable:true, value:(m)=>{asked.push(m);return answers.shift();} });
  try {
    const e = openEditor(target, "current\n", { marks: () => [], save: async () => ({ kind:"refused", newer:"newer\n" }) });
    e.setMarks([{ artifact:"UC-019", line:1, kind:"warning", rule:"A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT", what:"unclear", fix:"clarify" }]);
    assert.match(byClass(target,"marks")[0].textContent, /UC-019:1: warning/);
    e.showDraft("draft\n", "current\n");
    assert.equal(e.text(), "draft\n"); assert.match(byClass(target,"preview")[0].textContent, /draft/);
    assert.deepEqual(byClass(target,"diff")[0].children.map((r)=>r.textContent), ["+ draft", "- current"]);
    byTag(target,"button")[0].dispatchEvent(new Event("click")); await new Promise((r)=>setImmediate(r));
    assert.equal(byTag(target,"textarea")[0].value, "draft\n"); assert.match(byClass(target,"newer")[0].textContent, /newer/);
    e.close(); assert.equal(byClass(target,"editor").length,1); e.close(); assert.equal(byClass(target,"editor").length,0); assert.equal(asked.length,2);
    const clean=document.createElement("div"), saved=openEditor(clean,"x\n",{marks:()=>[],save:async()=>({kind:"saved",link:"#"})});
    byTag(clean,"textarea")[0].value="saved\n"; byTag(clean,"textarea")[0].dispatchEvent(new Event("input")); byTag(clean,"button")[0].dispatchEvent(new Event("click")); await new Promise((r)=>setImmediate(r)); saved.close(); assert.equal(byClass(clean,"editor").length,0);
  } finally { if(prior)Object.defineProperty(globalThis,"confirm",prior);else delete globalThis.confirm; }
});

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_RELEASE20_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-release20-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [file, needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, file), original = readFileSync(source), testFile = join(copied, "tests/markdown-render-release-20.test.mjs");
      const digest = (value) => createHash("sha256").update(value).digest("hex");
      assert.equal(original.toString().split(needle).length - 1, 1, `${id}: unique fault target`);
      const invoke = () => { const env = { ...process.env, AGENT_M_RELEASE20_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT;
        return spawnSync(process.execPath, ["--test", "--test-name-pattern", id, "tests/markdown-render-release-20.test.mjs"], { cwd: copied, encoding: "utf8", timeout: 15_000, env }); };
      let faultHash, failed, faultEnded, restoreStarted, restoredHash, passed, restoredEnded;
      const faultStarted = new Date().toISOString();
      try { writeFileSync(source, original.toString().replace(needle, replacement)); faultHash = digest(readFileSync(source)); failed = invoke(); faultEnded = new Date().toISOString(); }
      finally { restoreStarted = new Date().toISOString(); writeFileSync(source, original); restoredHash = digest(readFileSync(source)); restoredEnded = new Date().toISOString(); }
      passed = invoke();
      console.log("release20-counterproof " + JSON.stringify({ id, file, needle, replacement, sourceHash: digest(original), faultHash, restoredHash, testHash: digest(readFileSync(testFile)), faultStarted, faultEnded, restoreStarted, restoredEnded, argv: [process.execPath, "--test", "--test-name-pattern", id, "tests/markdown-render-release-20.test.mjs"], cwd: copied, failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr } }));
      assert.equal(failed.status, 1, id); assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`)); assert.equal(restoredHash, digest(original), id); assert.equal(passed.status, 0, id); assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
