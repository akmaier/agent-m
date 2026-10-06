// Release tests of sprint 04 — ITM-203, "The modules view draws one arrow per used module": the component diagram of the
// modules view (UC-025 step 5), as the dashboard's architecture page draws it since the change between jobs that made the page
// call MOD-trace-pages (#102, merged in 7e8f0f1). Written by tester-opus (claude-opus-5-5), the Release tester of
// docs/process.md, who implemented none of it — neither ITM-203 (developer-opus-a) nor #102 (developer-opus-b) —, from UC-025
// and the requirements it names; started on sprint/04 at 7e8f0f1, 2026-10-06.
//
// Module: MOD-trace-pages
// Guards: UC-025; A MODULE BELONGS TO ONE SUBSYSTEM; ONE MODULE, ONE FILE; DIAGRAMS ARE MERMAID IN MARKDOWN; THE TRACEABILITY MATRIX IS DERIVED
// Level: release
//
// How the page is reached: the real dashboard runs in tests/app-harness.mjs, as the release tests of sprints 01 and 02 run it —
// a page load, then the architecture page (#arc). GitHub's API is the harness's fixture server, serving Agent M's own
// architecture: every file under docs/architecture/ of this checkout, as it stands. Beside it stands a SPEC.md of this file's
// own: no test opens Agent M's own SPEC.md (tests/test_release_sprint_02_c.py), and the page reads a SPEC only for what the
// files it lists wait for, which the diagram does not draw. Mermaid, to which the page hands its diagrams
// (docs/assets/dashboard-app.mjs, renderMermaid), is replaced by a recorder, as GitHub is replaced by the fixture server: it
// keeps the configuration the page initialises it with and the text of every diagram the page hands it — the text Mermaid
// draws. No request leaves the process.
//
// What is expected, stated from UC-025 and the files before anything runs. Each case derives its numbers from the files it
// serves, so that it holds for the architecture as it stands; the numbers in brackets are those of 7e8f0f1.
// - The modules are the files docs/architecture/MOD-<slug>.md, each the module it is named after (ONE MODULE, ONE FILE) [52].
// - A module's subsystem is the one decision, among those its front matter `follows`, that ARC-037 — the decision stating the
//   whole architecture — lists in its table of subsystems (UC-025 step 3: "its subsystem, by the decision that states it";
//   A MODULE BELONGS TO ONE SUBSYSTEM) [11 subsystems, ARC-038 to ARC-048].
// - A module uses the modules its front matter `uses` names, `MOD-<slug>.<interface>` (UC-025 step 2: "the interfaces of
//   other modules each uses") [378 pairs of a module and a module it uses, from 1,062 used interfaces].
// - A used module without a file: Agent M's own architecture has none, so that case takes one file away (MOD-documents).
// Each case's own comment states its input, precondition and expected result. Counter-proofs: the pull request of these tests.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { repoServer, openDashboard } from "./app-harness.mjs";

// ------------------------------------------------------------------------------------------------ the input

const ARCH = new URL("../docs/architecture/", import.meta.url);
// Agent M's own architecture, as this checkout holds it: every file under docs/architecture/, by its path in the repository.
const OWN = Object.fromEntries(readdirSync(ARCH).filter((f) => f.endsWith(".md")).sort()
  .map((f) => [`docs/architecture/${f}`, readFileSync(new URL(f, ARCH), "utf8")]));
const SPEC = "# A SPEC of the fixture\n\n**VERBINDLICH (SPEC)**\n\nThe architecture page reads a SPEC for what the files it lists " +
  "wait for; the component diagram draws none of it.\n";

// A file's front matter as the file states it: each key with its value, a list key with its items.
function frontMatter(path, text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(m, `${path} opens with its front matter`);
  const out = {};
  let key = null;
  for (const line of m[1].split("\n")) {
    let k;
    if ((k = /^([a-z_]+):[ \t]*(.*)$/.exec(line))) {
      key = k[1];
      out[key] = k[2].trim() === "" || k[2].trim() === "[]" ? [] : k[2].trim();
    } else if ((k = /^[ \t]+-[ \t]+(.+)$/.exec(line))) {
      assert.ok(Array.isArray(out[key]), `${path}: a list item stands under a list key`);
      out[key].push(k[1].trim());
    }
  }
  return out;
}

// The modules of an architecture, as UC-025 step 2 reads them from their files: each module's identifier, the decisions it
// follows, and the modules whose interfaces it uses — each once, however many of its interfaces it uses — with the count of
// those interfaces.
function modulesOf(files) {
  return Object.entries(files).filter(([p]) => /^docs\/architecture\/MOD-[^/]+\.md$/.test(p)).map(([p, text]) => {
    const fm = frontMatter(p, text);
    assert.equal(fm.id, p.slice("docs/architecture/".length, -".md".length), `${p} is the module it is named after`);
    const uses = fm.uses ?? [];
    for (const u of uses) assert.match(u, /^MOD-[a-z0-9-]+\.\w+$/, `${p}: a use names a module and one of its interfaces`);
    return { id: fm.id, follows: fm.follows ?? [], uses: [...new Set(uses.map((u) => u.split(".")[0]))].sort(), interfaces: uses.length };
  });
}

// The subsystems, as the decision stating the whole architecture lists them: ARC-037, its table under "### Subsystems" —
// decision -> the subsystem's name.
function subsystemsOf(files) {
  const [path, text] = Object.entries(files).find(([p]) => /^docs\/architecture\/ARC-037-[^/]+\.md$/.test(p)) ?? [];
  assert.ok(text, "ARC-037, the decision stating the whole architecture, is served");
  const at = text.indexOf("\n### Subsystems\n");
  assert.ok(at >= 0, `${path} has its table of subsystems`);
  const rest = text.slice(at + "\n### Subsystems\n".length), end = rest.search(/\n#{1,6} /);
  const section = end < 0 ? rest : rest.slice(0, end);
  const subsystems = new Map([...section.matchAll(/^\| ([^|]+?) \| (ARC-\d{3}) \|/gm)].map((m) => [m[2], m[1]]));
  assert.ok(subsystems.size > 0, `${path} lists its subsystems with their decisions`);
  return subsystems;
}

// A module's subsystem: the one decision it follows that is a subsystem's. Precondition of every case: each module follows
// exactly one (A MODULE BELONGS TO ONE SUBSYSTEM, as the files state it).
function subsystemOf(m, subsystems) {
  const own = m.follows.filter((a) => subsystems.has(a));
  assert.equal(own.length, 1, `precondition: ${m.id} follows one subsystem's decision, not ${JSON.stringify(m.follows)}`);
  return own[0];
}

// ------------------------------------------------------------------------------------------------ the page

// The text of HTML, as a browser's textContent gives it: its entities read back.
const NAMED = { quot: '"', amp: "&", lt: "<", gt: ">", apos: "'", nbsp: "\u00a0" };
const textOf = (html) => html.replace(/&(#x[0-9a-f]+|#\d+|quot|amp|lt|gt|apos|nbsp);/gi, (_, e) => (e[0] === "#"
  ? String.fromCodePoint(/^#x/i.test(e) ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : NAMED[e.toLowerCase()]));

// The architecture page of a repository holding `files` (and the fixture's SPEC): a page load, then #arc, with Mermaid replaced by
// the recorder. The harness's document finds controls by an attribute only; the page's own search for diagrams —
// `pre > code.language-mermaid` in <main> (renderMermaid) — is answered here from the HTML <main> holds: each block with its text,
// and a <pre> the page replaces by the node it hands to Mermaid.
// -> { server, page, mermaid: { config, texts } }
async function architecturePage(files) {
  const server = await repoServer({ files: { "SPEC.md": SPEC, ...files } });
  const page = await openDashboard({ server, hash: "" });
  const mermaid = { config: null, texts: [] };
  const main = globalThis.document.getElementById("main");
  const own = main.querySelectorAll;
  main.querySelectorAll = (sel) => (sel === "pre > code.language-mermaid"
    ? [...main.innerHTML.matchAll(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g)]
      .map((m) => ({ textContent: textOf(m[1]), parentElement: { replaceWith() {} } }))
    : own.call(main, sel));
  globalThis.mermaid = {
    initialize: (config) => { mermaid.config = config; },
    run: async ({ nodes }) => { mermaid.texts.push(...nodes.map((n) => n.textContent)); },
  };
  try {
    await page.go("#arc");
  } finally {
    delete globalThis.mermaid;
  }
  return { server, page, mermaid };
}

// ------------------------------------------------------------------------------------------------ the diagram, as it is read

// A Mermaid text in one statement per entry: lines, split at `;` outside quotes; comment lines (`%%`) left out.
function* statements(text) {
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    let cur = "", quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      if (ch === ";" && !quoted) { if (cur.trim()) yield cur.trim(); cur = ""; } else cur += ch;
    }
    if (cur.trim()) yield cur.trim();
  }
}

// A node at the start of `s`, in Mermaid's flowchart syntax: its identifier, the text its shape holds (null without a shape),
// its class, and what follows it.
function nodeAt(s) {
  const id = /^\w+/.exec(s);
  if (!id) return null;
  let rest = s.slice(id[0].length), label = null;
  const open = /^(\[\[|\[\(|\[\/|\[\\|\(\(\(|\(\(|\(\[|\{\{|\[|\(|\{|>)/.exec(rest);
  if (open) {
    rest = rest.slice(open[0].length).trimStart();
    if (rest.startsWith('"')) {
      const end = rest.indexOf('"', 1);
      if (end < 0) return null;
      label = rest.slice(1, end);
      rest = rest.slice(end + 1).trimStart();
    } else {
      const end = rest.search(/[\])}]/);
      if (end < 0) return null;
      label = rest.slice(0, end).trim();
      rest = rest.slice(end);
    }
    const close = /^(\]\]|\)\]|\/\]|\\\]|\)\)\)|\)\)|\]\)|\}\}|\]|\)|\})/.exec(rest);
    if (!close) return null;
    rest = rest.slice(close[0].length);
  }
  const cls = /^:::\w+/.exec(rest);
  if (cls) rest = rest.slice(cls[0].length);
  return { id: id[0], label, rest };
}

// A statement of nodes and links — `a["text"] & b --> c -.-> d` —, entered into the diagram `d`; false if it is not one.
function nodesAndLinks(s, d, mention) {
  const groups = [], links = [];
  let rest = s;
  for (;;) {
    const group = [];
    for (;;) {
      const n = nodeAt(rest);
      if (!n) return false;
      group.push(n);
      rest = n.rest.trimStart();
      if (!rest.startsWith("&")) break;
      rest = rest.slice(1).trimStart();
    }
    groups.push(group);
    if (!rest) break;
    const l = /^(<?)(-{2,}|={2,}|-\.+-|~{3,})([>ox]?)(?:\|([^|]*)\|)?\s*/.exec(rest);
    if (!l) return false;
    links.push({ back: l[1] === "<", head: l[3] !== "", text: l[4] ?? null });
    rest = rest.slice(l[0].length);
    if (!rest) return false;
  }
  for (const n of groups.flat()) mention(n.id, n.label);
  links.forEach((l, i) => { for (const a of groups[i]) for (const b of groups[i + 1]) d.links.push({ from: a.id, to: b.id, ...l }); });
  return true;
}

// The diagram as its reader sees it, read from its Mermaid text: its kind; every node with the texts it is given and the
// subgraphs it is drawn in; every subgraph with its text; every link with its arrowheads. A statement this reader does not know
// is kept in `unknown`, which each case requires empty — a change of the diagram's form is noticed, never misread.
function readDiagram(text) {
  const d = { kind: null, nodes: new Map(), subgraphs: new Map(), links: [], styles: [], unknown: [] };
  const open = [];
  const mention = (id, label) => {
    if (!d.nodes.has(id)) d.nodes.set(id, { id, labels: [], in: new Set() });
    const n = d.nodes.get(id);
    if (label !== null) n.labels.push(label);
    for (const s of open) n.in.add(s);
  };
  for (const s of statements(text)) {
    let m;
    if (d.kind === null) {
      d.kind = /^(flowchart|graph)\s+(TB|TD|BT|RL|LR)$/.exec(s)?.[1] ?? "unknown";
      if (d.kind === "unknown") d.unknown.push(s);
    } else if ((m = /^subgraph\s+(\w+)\s*(?:\[\s*(?:"([^"]*)"|([^\]"]*))\s*\])?$/.exec(s))) {
      d.subgraphs.set(m[1], { id: m[1], label: m[2] ?? m[3] ?? m[1], in: [...open] });
      open.push(m[1]);
    } else if (s === "end") {
      if (!open.pop()) d.unknown.push(s);
    } else if (/^(direction\s+(TB|TD|BT|RL|LR)|classDef\s+\w+\s+\S.*|class\s+\w+(,\w+)*\s+\w+|style\s+\w+\s+\S.*|linkStyle\s+\S.*)$/.test(s)) {
      d.styles.push(s);
    } else if (!nodesAndLinks(s, d, mention)) {
      d.unknown.push(s);
    }
  }
  if (open.length) d.unknown.push(`no end of subgraph ${open.join(", ")}`);
  return d;
}

// The text a node or subgraph shows: Mermaid's entity codes (#quot; …) read back, a <br/> as a line break.
const shown = (label) => label.replace(/<br\s*\/?>/gi, "\n")
  .replace(/#(quot|lt|gt|amp|nbsp|\d+);/g, (_, e) => (/^\d+$/.test(e) ? String.fromCodePoint(Number(e)) : NAMED[e]));

// The subsystems a box's text names: a subsystem's decision by its identifier, or the subsystem by its name.
const namedSubsystems = (text, subsystems) => [...subsystems].filter(([arc, name]) =>
  new RegExp(`(^|[^\\w-])(${arc}|${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})($|[^\\w-])`).test(text)).map(([arc]) => arc);

// What the diagram draws, in the terms of UC-025 step 5: for each module — by the identifier its box shows — its boxes, each
// with the text it shows and the subsystems whose boxes it stands in; the subsystems' boxes; the arrows between modules; and the
// modules whose box is marked missing. A box that shows no module's identifier is kept under the text it shows.
function drawing(text, subsystems) {
  const d = readDiagram(text);
  const shows = (n) => (n.labels.length ? shown(n.labels[n.labels.length - 1]) : n.id);
  const moduleOf = new Map([...d.nodes.values()].map((n) => [n.id, /MOD-[a-z0-9]+(?:-[a-z0-9]+)*/.exec(shows(n))?.[0]
    ?? `(a box showing "${shows(n)}")`]));
  const boxes = {};
  for (const n of d.nodes.values()) {
    const inside = [...new Set([...n.in].flatMap((s) => namedSubsystems(shown(d.subgraphs.get(s).label), subsystems)))].sort();
    (boxes[moduleOf.get(n.id)] ??= []).push({ shows: shows(n), subsystems: inside });
  }
  return {
    kind: d.kind,
    unknown: d.unknown,
    boxes,
    subsystemBoxes: [...d.subgraphs.values()].map((s) => namedSubsystems(shown(s.label), subsystems)),
    arrows: d.links.map((l) => `${moduleOf.get(l.from)} ${l.back ? "<" : ""}--${l.head ? ">" : ""} ${moduleOf.get(l.to)}`).sort(),
    missing: Object.keys(boxes).filter((id) => boxes[id].some((b) => /\bmissing\b/i.test(b.shows))).sort(),
  };
}

// The arrows UC-025 step 5 asks for: one from each module to each module it uses.
const arrowsOf = (modules) => modules.flatMap((m) => m.uses.map((u) => `${m.id} --> ${u}`)).sort();

// What the page wrote or asked to write: no commit, no ref, no request other than a read.
const writesOf = (server) => server.requests.filter((r) => /^write\b|^(other|handler) (?!GET )/.test(r));

// ------------------------------------------------------------------------------------------------ UC-025 step 5

// UC-025 step 5 · A MODULE BELONGS TO ONE SUBSYSTEM · ONE MODULE, ONE FILE · DIAGRAMS ARE MERMAID IN MARKDOWN.
// Input: Agent M's own architecture. Precondition: each module file follows one subsystem's decision.
// Expected: the page hands Mermaid one diagram, a flowchart read statement by statement; it has one box for each module file and
// none for anything else; each box stands in the box of its module's subsystem — the decision ARC-037 lists among those the
// module follows — and in no other subsystem's box; no subsystem has two boxes.
test("ITM-203 · UC-025 step 5 — every module of Agent M is one box, inside the box of its subsystem and of no other", async (t) => {
  const subsystems = subsystemsOf(OWN), modules = modulesOf(OWN);
  const expected = Object.fromEntries(modules.map((m) => [m.id, [[subsystemOf(m, subsystems)]]]));
  const { mermaid } = await architecturePage(OWN);
  assert.equal(mermaid.texts.length, 1, "the architecture page hands Mermaid one diagram, its component diagram");
  const drawn = drawing(mermaid.texts[0], subsystems);
  assert.match(drawn.kind, /^(flowchart|graph)$/, "a Mermaid flowchart");
  assert.deepEqual(drawn.unknown, [], "every statement is a box, a subsystem's box, an arrow or a style");
  assert.deepEqual(Object.keys(drawn.boxes).sort(), modules.map((m) => m.id).sort(), "a box for every module file, and for nothing else");
  assert.deepEqual(Object.fromEntries(Object.entries(drawn.boxes).map(([id, bs]) => [id, bs.map((b) => b.subsystems)])), expected,
    "each module once, in the box of its subsystem alone");
  const named = drawn.subsystemBoxes.flat();
  assert.equal(new Set(named).size, named.length, "one box per subsystem");
  t.diagnostic(`${modules.length} module boxes in ${new Set(named).size} subsystem boxes`);
});

// UC-025 step 5 · THE TRACEABILITY MATRIX IS DERIVED.
// Input: Agent M's own architecture. Precondition: some module uses another through more than one interface — the files name
// more used interfaces than pairs of a module and a module it uses.
// Expected: exactly one arrow from each module to each module its file says it uses, pointing at the module used, and no other
// arrow — as many arrows as such pairs, however many interfaces each use names.
test("ITM-203 · UC-025 step 5 — one arrow from each module to each module it uses, however many of its interfaces it uses", async (t) => {
  const modules = modulesOf(OWN), expected = arrowsOf(modules);
  const interfaces = modules.reduce((n, m) => n + m.interfaces, 0);
  assert.ok(interfaces > expected.length, `precondition: ${interfaces} used interfaces, ${expected.length} pairs`);
  const { mermaid } = await architecturePage(OWN);
  const drawn = drawing(mermaid.texts[0], subsystemsOf(OWN));
  assert.deepEqual(drawn.unknown, []);
  assert.deepEqual(drawn.arrows, expected, "one arrow per used module, from the user to the module it uses");
  t.diagnostic(`${drawn.arrows.length} arrows for ${interfaces} used interfaces`);
});

// UC-025 step 5 · ONE MODULE, ONE FILE · THE TRACEABILITY MATRIX IS DERIVED.
// Input: Agent M's own architecture without docs/architecture/MOD-documents.md — the module that most modules use. Precondition:
// several modules use MOD-documents, each through one interface or more.
// Expected: MOD-documents, used but without a file, is one box, marked missing, and the arrow of each module that uses it ends
// there; no other box is marked missing; every arrow is that of a use the served files state; nothing is written. Counter-case:
// with its file, no box of Agent M's architecture is marked missing.
test("ITM-203 · UC-025 step 5 — a used module that has no file is one box marked missing, where the arrows of its users end", async (t) => {
  const TAKEN = "docs/architecture/MOD-documents.md";
  const without = Object.fromEntries(Object.entries(OWN).filter(([p]) => p !== TAKEN));
  const modules = modulesOf(without);
  const users = modules.filter((m) => m.uses.includes("MOD-documents")).map((m) => m.id).sort();
  assert.ok(users.length > 1, "precondition: several modules use MOD-documents");
  const { server, mermaid } = await architecturePage(without);
  const drawn = drawing(mermaid.texts[0], subsystemsOf(without));
  assert.deepEqual(drawn.unknown, []);
  assert.equal(drawn.boxes["MOD-documents"]?.length, 1, `one box, though ${users.length} modules use it`);
  assert.match(drawn.boxes["MOD-documents"][0].shows, /\bmissing\b/i, "marked missing");
  assert.deepEqual(drawn.missing, ["MOD-documents"], "and no other box is");
  assert.deepEqual(drawn.arrows.filter((a) => a.endsWith(" MOD-documents")), users.map((u) => `${u} --> MOD-documents`),
    "the arrow of each of its users ends at it");
  assert.deepEqual(drawn.arrows, arrowsOf(modules), "every arrow is a use the files at the commit shown state");
  assert.deepEqual(writesOf(server), [], "the diagram is computed, nothing is written");

  const whole = await architecturePage(OWN);
  const all = drawing(whole.mermaid.texts[0], subsystemsOf(OWN));
  assert.equal(all.boxes["MOD-documents"]?.length, 1);
  assert.deepEqual(all.missing, [], "with its file, no box is marked missing");
  t.diagnostic(`without its file: "${drawn.boxes["MOD-documents"][0].shows}", ${users.length} arrows end there`);
});

// ------------------------------------------------------------------------------------------------ Mermaid's limit

// UC-025 step 5 · DIAGRAMS ARE MERMAID IN MARKDOWN.
// Input: Agent M's own architecture. Precondition: the page's Mermaid (docs/assets/vendor/mermaid.min.js, 12.0.0) draws
// "Maximum text size in diagram exceeded" in place of a diagram whose text is longer than its maxTextSize, 50,000 characters
// unless the page initialises it with another; what it measures is the text the page hands it, trimmed, with a <br> written as
// <br/>, less any front matter, directive and comment — at most the length measured here.
// Expected: the page hands Mermaid the whole diagram — a box for each of Agent M's modules — in a text no longer than the limit
// in force, so that Mermaid draws it and not the message.
test("ITM-203 · the page draws Agent M's component diagram without Mermaid's \"Maximum text size in diagram exceeded\"", async (t) => {
  const bundle = readFileSync(new URL("../docs/assets/vendor/mermaid.min.js", import.meta.url), "utf8");
  const limit = Number(/\bmaxTextSize:([0-9.e]+)[,}]/.exec(bundle)?.[1]);
  assert.equal(limit, 50000, "precondition: Mermaid's limit is 50,000 characters, as ITM-203 states it");
  assert.ok(bundle.includes("Maximum text size in diagram exceeded"), "precondition: above it, Mermaid draws this message");
  const { mermaid } = await architecturePage(OWN);
  assert.ok(mermaid.config, "the page initialises Mermaid before it hands it the diagram");
  const inForce = mermaid.config.maxTextSize ?? limit;
  assert.equal(mermaid.texts.length, 1, "one diagram");
  const text = mermaid.texts[0];
  assert.equal(Object.keys(drawing(text, subsystemsOf(OWN)).boxes).length, modulesOf(OWN).length, "the whole diagram");
  const measured = text.replace(/\r\n?/g, "\n").trim().replace(/<br\s*\/?>/gi, "<br/>").length;
  assert.ok(measured <= inForce, `${measured} characters, of at most ${inForce} that Mermaid draws`);
  t.diagnostic(`${measured} characters, of at most ${inForce}`);
});

// ------------------------------------------------------------------------------------------------ the explanation

// UC-025 step 5, as the page explains it.
// Input: Agent M's own architecture. Expected: under the diagram, in its panel, an explanation that can be expanded says what
// the diagram draws — one box per module, inside the box of its subsystem; one arrow from a module to each module it uses; a used
// module that has no file drawn as a box marked missing.
test("ITM-203 · the explanation under the component diagram says what the diagram draws", async () => {
  const { page } = await architecturePage(OWN);
  const main = page.main();
  const at = main.indexOf('<pre><code class="language-mermaid">');
  assert.ok(at > 0, "the diagram stands on the page");
  const under = main.slice(main.indexOf("</pre>", at), main.indexOf("</section>", at));
  const m = /<details class="explain">\s*<summary>What is this\?<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/.exec(under);
  assert.ok(m, "an explanation that can be expanded stands under the diagram, in its panel");
  const says = textOf(m[1].replace(/<[^>]*>/g, "")).replace(/\s+/g, " ");
  for (const [what, words] of [
    ["one box per module", /\bone box (per|for (each|every)) module\b/i],
    ["inside the box of its subsystem", /\binside (the box of its subsystem|its subsystem's box)\b/i],
    ["one arrow per used module", /\bone arrow (per used module|from a module to each module it uses|to each module it uses)\b/i],
    ["a used module that has no file, marked missing", /\bused module (that has no|without a|with no) file\b[^.]*\bmarked\b[^.]*\bmissing\b/i],
  ]) assert.match(says, words, `it says: ${what}`);
});
