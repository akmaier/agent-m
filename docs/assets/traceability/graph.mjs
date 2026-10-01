// The link graph of one commit — the names every artifact states, as nodes and edges — and the views that read only it: what
// traces to a requirement, the coverage gaps, the module rows with their gaps, and the impact list of a requirement change.
// Kernel (ARC-003): pure functions over the files the caller read; nothing is read, sent or stored here
// (THE TRACEABILITY MATRIX IS DERIVED). Gaps are lists; nothing here refuses or blocks
// (UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN, MODULE GAPS ARE REPORTED, NOT FORBIDDEN).
//
// Module: MOD-traceability
//
// ARC-006, *Traceability is computed from one pinned commit*: the nodes are the requirements of the SPEC and of the open
// queues, the use cases, the decisions and modules, the code files and the tests; the edges are the names each one states —
// a use case's `realises`, a decision's `forced_by`, a module's `realises`, `follows` and `uses`, the `Module:` line of code
// and tests and the `Guards:` line of a test (ARC-020), and the requirements an open queue entry would add, change or
// withdraw. Every edge names its target by identifier — a requirement by its name, every other artifact by its identifier,
// code and tests by their path — never by a section, a line or a file name (A REFERENCE NAMES THE IDENTIFIER, NOT THE
// POSITION). A name no node carries is kept as an unknown name, with the note whether it was withdrawn.

import { isCodePath, kindOfPath, parseArchitecture } from "../artifacts.mjs";
import { parseRequirements } from "../artifacts/requirements.mjs";
import { parseUseCase } from "../artifacts/use-cases.mjs";
import { headerTags } from "../artifacts/headers.mjs";
import { parseQueueIndex, sectionForEntry } from "../review-core.mjs";

const SPEC = "SPEC.md";
// A queue entry of SPEC changes: docs/spec-freigaben/<queue>/<nn>-<slug>.md — not its rationale, index or decisions.
const QUEUE_ENTRY = /^docs\/spec-freigaben\/[^/]+\/\d{2}-[^/]+\.md$/;
const isQueueEntry = (path) => QUEUE_ENTRY.test(path) && !/\.begruendung\.md$/.test(path);
const queueOf = (path) => path.slice(0, path.lastIndexOf("/"));
const entryNr = (path) => Number(/\/(\d{2})-[^/]+\.md$/.exec(path)[1]);
// An entry the approval engine found decided proposes nothing any more.
const DECIDED = new Set(["applied", "superseded"]);

const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const sorted = (xs) => [...new Set(xs)].sort(byText);

// Whether a queue entry states a requirement as the SPEC does: every field the same.
const FIELDS = ["withdrawn", "source", "rule", "occasion", "check", "note"];
const same = (a, b) => FIELDS.every((k) => (a[k] ?? null) === (b[k] ?? null));

// ---------------------------------------------------------------- the graph

// linkGraph(snapshot) -> { nodes, edges, unknown, withdrawn } — snapshot: the files of one commit as
//   files    { path: text } — SPEC.md, the queue entries, the use cases, the decisions and modules, code and tests, and a
//            queue's index.md, which names the section each of its entries replaces; any other file is not read (a matrix kept
//            by hand among them included);
//   headers  [{ path, modules, guards?, test }] — optional: the header lines of code files whose texts the caller did not keep
//            (traceability.mjs moduleHeaders gives them); a path among `files` is read from its text instead;
//   status   { [identifier or queue entry path]: status } — optional: the status the approval engine derived for a use case,
//            decision or module, or for a queue entry (deriveSpecStatus); an entry `applied` or `superseded` proposes nothing.
// nodes { [id]: node } — a requirement { id, kind: "requirement", path, line, section, source, status: "accepted" in the SPEC,
// "proposed" when only an open entry adds it }, a use case or decision { id, kind, path, title, status }, a module the same with
// its `names`, `follows`, `uses`, `provides` and `interfaces`, a code file or test { id: path, kind: "code" | "test", path,
// modules, guards }, a queue entry { id: path, kind: "proposal", path, status }. edges [{ from, to, kind }] — kind one of
// realises, forced_by, follows, uses (with `iface`), module, guards, proposes (with `change`: add, change or withdraw).
// unknown [{ name, withdrawn, from }] — every name an edge points at that no node carries, by name; withdrawn [name] — the
// requirements, decisions and modules the commit keeps as withdrawn.
export function linkGraph(snapshot = {}) {
  const files = snapshot?.files ?? {}, given = snapshot?.status ?? {}, headers = snapshot?.headers ?? [];
  const status = (key) => (has(given, key) ? given[key] ?? null : null);
  const nodes = {}, edges = [], withdrawn = new Set();
  const edge = (from, to, kind, extra = {}) => edges.push({ from, to, kind, ...extra });
  const paths = Object.keys(files).sort(byText);
  const text = (path) => String(files[path] ?? "");

  // The requirements of the SPEC: a live one is a node, a withdrawn one is remembered by its name.
  const spec = paths.includes(SPEC) ? parseRequirements(text(SPEC)) : new Map();
  for (const r of spec.values()) {
    if (r.withdrawn) { withdrawn.add(r.name); continue; }
    nodes[r.name] = { id: r.name, kind: "requirement", path: SPEC, line: r.line, section: r.section, source: r.source,
      status: "accepted" };
  }

  // The live requirements of the SPEC section an entry replaces, by name — read only when the queue's index.md is among the
  // files: its row for the entry names the anchor and end anchor (an entry its index does not list is read at its own first
  // line, where the approval engine finds an entry's text); sectionForEntry gives the section, also one that another entry
  // of the queue creates. Without the index, an anchor the SPEC does not hold, or no SPEC, the entry replaces no known section.
  const replaced = (path) => {
    const queue = queueOf(path), index = `${queue}/index.md`;
    if (!has(files, index) || !spec.size) return [];
    const listed = new Map(parseQueueIndex(text(index)).entries.map((e) => [e.nr, e]));
    const own = new Map(paths.filter((p) => isQueueEntry(p) && queueOf(p) === queue).map((p) => [entryNr(p), text(p)]));
    const entries = [...new Set([...listed.keys(), ...own.keys()])].sort((a, b) => a - b).map((nr) => ({
      nr, anchor: listed.get(nr)?.anchor ?? String(own.get(nr) ?? "").split("\n")[0], bis: listed.get(nr)?.bis ?? null,
      proposalText: own.get(nr) ?? "",
    }));
    const s = sectionForEntry({ specText: text(SPEC), entries, nr: entryNr(path) });
    if (s.error) return [];
    return [...parseRequirements(s.current).values()].filter((r) => !r.withdrawn && spec.get(r.name)?.withdrawn === false)
      .map((r) => r.name);
  };

  // Code and tests: their Module: and Guards: lines, from their text or from the headers the caller read.
  const code = (path, modules, guards, test) => {
    nodes[path] = test ? { id: path, kind: "test", path, modules, guards } : { id: path, kind: "code", path, modules, guards: [] };
    for (const m of modules) edge(path, m, "module");
    if (test) for (const g of guards) edge(path, g, "guards");
  };

  for (const path of paths) {
    if (path === SPEC) continue;
    if (isQueueEntry(path)) {
      // An open entry proposes what it states otherwise than the SPEC: a name the SPEC lacks is added, a live one withdrawn or
      // changed; a requirement it repeats word for word is not touched. It replaces its section byte for byte (UC-006 step 6),
      // so a live requirement of that section it no longer states — renamed in place, or left out — leaves the SPEC: withdrawn
      // (A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED — the old name leaves, a new one is added).
      const st = status(path);
      if (DECIDED.has(st)) continue;
      nodes[path] = { id: path, kind: "proposal", path, status: st };
      const stated = parseRequirements(text(path));
      for (const name of replaced(path)) if (!stated.has(name)) edge(path, name, "proposes", { change: "withdraw" });
      for (const r of stated.values()) {
        const now = spec.get(r.name);
        const change = !now ? (r.withdrawn ? null : "add") : same(now, r) ? null
          : r.withdrawn && !now.withdrawn ? "withdraw" : "change";
        if (!change) continue;
        edge(path, r.name, "proposes", { change });
        if (change === "add" && !has(nodes, r.name)) {
          nodes[r.name] = { id: r.name, kind: "requirement", path, line: r.line, section: r.section, source: r.source,
            status: "proposed" };
        }
      }
      continue;
    }
    const kind = kindOfPath(path);
    if (kind === "use-case") {
      const u = parseUseCase(path, text(path));
      nodes[u.id] = { id: u.id, kind, path, title: u.title, status: status(u.id) };
      for (const n of u.realises) edge(u.id, n, "realises");
      continue;
    }
    if (kind === "architecture-decision" || kind === "module") {
      const a = parseArchitecture(path, text(path));
      if (a.withdrawn) { withdrawn.add(a.id); continue; }
      if (kind === "architecture-decision") {
        nodes[a.id] = { id: a.id, kind, path, title: a.title, status: status(a.id) };
        for (const n of a.names) edge(a.id, n, "forced_by");
        continue;
      }
      nodes[a.id] = { id: a.id, kind, path, title: a.title, status: status(a.id), names: a.names, follows: a.follows,
        uses: a.uses, provides: a.provides, interfaces: a.interfaces };
      for (const n of a.names) edge(a.id, n, "realises");
      for (const f of a.follows) edge(a.id, f, "follows");
      for (const u of a.uses) edge(a.id, u.module, "uses", { iface: u.iface });
      continue;
    }
    if (isCodePath(path)) {
      const t = headerTags(path, text(path));
      code(path, t.modules, t.guards, t.test);
    }
  }
  for (const h of [...headers].sort((a, b) => byText(a.path, b.path))) {
    if (h?.path == null || has(files, h.path) || has(nodes, h.path)) continue;
    code(h.path, [...(h.modules ?? [])], [...(h.guards ?? [])], Boolean(h.test));
  }

  // Every name an edge points at that no node carries, with what names it; a proposal's own targets are its business.
  const unknown = new Map();
  for (const e of edges) {
    if (e.kind === "proposes" || has(nodes, e.to)) continue;
    const u = unknown.get(e.to) ?? { name: e.to, withdrawn: withdrawn.has(e.to), from: [] };
    if (!u.from.includes(e.from)) u.from.push(e.from);
    unknown.set(e.to, u);
  }
  return {
    nodes, edges,
    unknown: [...unknown.values()].map((u) => ({ ...u, from: sorted(u.from) })).sort((a, b) => byText(a.name, b.name)),
    withdrawn: sorted(withdrawn),
  };
}

// ---------------------------------------------------------------- reading the graph

const nodesOf = (graph, kind) => Object.values(graph?.nodes ?? {}).filter((n) => n.kind === kind)
  .sort((a, b) => byText(a.id, b.id));
const edgesOf = (graph) => graph?.edges ?? [];
const nodeOf = (graph, id) => (has(graph?.nodes, id) ? graph.nodes[id] : undefined);
// The live artifacts of one kind that name `to` by an edge of one kind.
const naming = (graph, to, kind, via) => sorted(edgesOf(graph)
  .filter((e) => e.to === to && e.kind === via && nodeOf(graph, e.from)?.kind === kind).map((e) => e.from));
// What a name is in this graph: the status of its node, or withdrawn, or unknown.
const statusOf = (graph, name) => (has(graph.nodes, name) ? graph.nodes[name].status ?? null
  : (graph.withdrawn ?? []).includes(name) ? "withdrawn" : "unknown");
// The requirements the SPEC holds.
const specRequirements = (graph) => nodesOf(graph, "requirement").filter((r) => r.status === "accepted");

// tracesTo(graph, name) -> { sources, useCases, decisions, modules, tests, proposals } — everything that names one requirement
// at the commit the graph was built from: its source as written, the use cases realising it, the decisions it forces, the
// modules realising it, the tests guarding it, and the open queue entries that would add, change or withdraw it
// ({ entry, change, status }). A name no artifact states has empty lists.
export function tracesTo(graph, name) {
  const node = nodeOf(graph, name);
  return {
    sources: node?.kind === "requirement" && node.source ? [node.source] : [],
    useCases: naming(graph, name, "use-case", "realises"),
    decisions: naming(graph, name, "architecture-decision", "forced_by"),
    modules: naming(graph, name, "module", "realises"),
    tests: naming(graph, name, "test", "guards"),
    proposals: edgesOf(graph).filter((e) => e.to === name && e.kind === "proposes")
      .map((e) => ({ entry: e.from, change: e.change, status: nodeOf(graph, e.from)?.status ?? null }))
      .sort((a, b) => byText(a.entry, b.entry)),
  };
}

// requirementImpact(graph, name) -> [{ id, kind, path, via }] — every artifact that names a requirement, to be shown beside a
// proposal that changes it (A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST): the use cases realising it, the decisions it
// forces, the modules realising it and the tests guarding it, in that order. A withdrawn name lists what still names it; a
// name nothing states lists nothing. A queue entry is a proposal, not an artifact that hangs on the requirement.
const IMPACT = [["use-case", "realises"], ["architecture-decision", "forced_by"], ["module", "realises"], ["test", "guards"]];
export function requirementImpact(graph, name) {
  return IMPACT.flatMap(([kind, via]) => naming(graph, name, kind, via)
    .map((id) => ({ id, kind, path: graph.nodes[id].path, via })));
}

// coverageGaps(graph) -> { unrealised, realisingNothing, unknownNames, untested } — the lists of UC-020 step 7: the SPEC's
// requirements no use case realises, the use cases that realise no requirement, every name that matches nothing (with the
// note whether it was withdrawn, and what names it), and — once there are tests — the SPEC's requirements no test guards.
// They block nothing.
export function coverageGaps(graph) {
  const reqs = specRequirements(graph);
  const isRequirement = (name) => nodeOf(graph, name)?.kind === "requirement";
  const realising = (uc) => edgesOf(graph).some((e) => e.from === uc && e.kind === "realises" && isRequirement(e.to));
  const hasTests = nodesOf(graph, "test").length > 0;
  return {
    unrealised: reqs.filter((r) => !naming(graph, r.id, "use-case", "realises").length).map((r) => r.id),
    realisingNothing: nodesOf(graph, "use-case").filter((u) => !realising(u.id)).map((u) => u.id),
    unknownNames: (graph?.unknown ?? []).map((u) => ({ ...u, from: [...u.from] })),
    untested: hasTests ? reqs.filter((r) => !naming(graph, r.id, "test", "guards").length).map((r) => r.id) : [],
  };
}

// moduleRows(graph) -> { rows, gaps } — UC-025 steps 3 and 4. rows, one per module: { id, path, title, realises, follows, code,
// tests } — what it realises and follows, each { name, status } (the status of its node, withdrawn or unknown), the code files
// and the tests that name it, each test with what it guards. gaps [{ kind, artifact, names, withdrawn? }]:
//   realises-nothing                               a module that realises no requirement or use case
//   requirement-without-module                     a requirement of the SPEC that no module realises
//   module-without-test · module-without-code      a module no test exercises · that no code file names
//   code-without-module · code-names-two-modules   a code file or test that names no module · more than one
//   code-names-unknown-module                      a code file or test that names a module that does not exist
//   test-guards-what-its-module-does-not-realise   a test guarding a requirement or use case its module does not realise
//   unknown-name                                   a name a module or a test states that matches nothing, one gap per name
// MODULE GAPS ARE REPORTED, NOT FORBIDDEN: these are lines of a list, never an error; the view of a selection that ends a run
// is ITM-021's.
export function moduleRows(graph) {
  const mods = nodesOf(graph, "module");
  const files = [...nodesOf(graph, "code"), ...nodesOf(graph, "test")].sort((a, b) => byText(a.id, b.id));
  const realisesOf = (m) => edgesOf(graph).filter((e) => e.from === m && e.kind === "realises").map((e) => e.to);
  const rows = mods.map((m) => ({
    id: m.id, path: m.path, title: m.title,
    realises: m.names.map((name) => ({ name, status: statusOf(graph, name) })),
    follows: m.follows.map((name) => ({ name, status: statusOf(graph, name) })),
    code: files.filter((f) => f.kind === "code" && f.modules.includes(m.id)).map((f) => f.path),
    tests: files.filter((f) => f.kind === "test" && f.modules.includes(m.id)).map((f) => ({ path: f.path, guards: [...f.guards] })),
  }));
  const gaps = [];
  const gap = (kind, artifact, names = [], extra = {}) => gaps.push({ kind, artifact, names, ...extra });
  const unknownGaps = (artifact, names) => {
    for (const n of sorted(names)) {
      if (!has(graph.nodes, n)) gap("unknown-name", artifact, [n], { withdrawn: statusOf(graph, n) === "withdrawn" });
    }
  };
  for (const r of rows) {
    const live = realisesOf(r.id).filter((n) => ["requirement", "use-case"].includes(nodeOf(graph, n)?.kind));
    if (!live.length) gap("realises-nothing", r.id);
    if (!r.code.length) gap("module-without-code", r.id);
    if (!r.tests.length) gap("module-without-test", r.id);
    unknownGaps(r.id, edgesOf(graph).filter((e) => e.from === r.id && ["realises", "follows", "uses"].includes(e.kind))
      .map((e) => e.to));
  }
  for (const req of specRequirements(graph)) {
    if (!naming(graph, req.id, "module", "realises").length) gap("requirement-without-module", req.id);
  }
  for (const f of files) {
    if (!f.modules.length) gap("code-without-module", f.path);
    if (f.modules.length > 1) gap("code-names-two-modules", f.path, [...f.modules]);
    for (const m of f.modules) {
      if (nodeOf(graph, m)?.kind !== "module") {
        gap("code-names-unknown-module", f.path, [m], { withdrawn: statusOf(graph, m) === "withdrawn" });
      }
    }
    if (f.kind !== "test") continue;
    const own = f.modules.filter((m) => nodeOf(graph, m)?.kind === "module");
    const notRealised = f.guards.filter((g) => ["requirement", "use-case"].includes(nodeOf(graph, g)?.kind)
      && own.length && !own.some((m) => realisesOf(m).includes(g)));
    if (notRealised.length) gap("test-guards-what-its-module-does-not-realise", f.path, sorted(notRealised));
    unknownGaps(f.path, f.guards);
  }
  return { rows, gaps };
}
