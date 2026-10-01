// Traceability — what is derived from the artifacts of one commit: the link graph and the views over it (traceability/graph.mjs,
// re-exported here), the code files and tests that name a module, the impact list of an architecture change, and the component
// diagram. Kernel (ARC-003): pure functions over what the caller read; it reads nothing itself and stores nothing
// (THE TRACEABILITY MATRIX IS DERIVED).
//
// Module: MOD-traceability

import { isCodePath, isTestPath, headerModules } from "./artifacts.mjs";

export { linkGraph, tracesTo, coverageGaps, moduleRows, requirementImpact } from "./traceability/graph.mjs";

// ---------------------------------------------------------------- the impact list (UC-023 step 4, 4a, 4c)
//
// AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST: beside the difference to the last accepted text, the modules
// that follow the changed decision or use an interface the change alters or removes, the code files and tests that name each
// of them, and the requirements and use cases named before and after. Derived from the files at the commit shown; nothing is
// stored. A code file names its module in a header line `Module: MOD-<slug>` among its first lines (UC-024 step 7).

// Every code file and test among `paths` that names a module -> [{ path, modules, test }], by path. read(path) -> text. What a
// caller that keeps no texts gives linkGraph as its `headers`.
export async function moduleHeaders({ paths, read }) {
  const code = [...paths].filter(isCodePath).sort();
  const texts = await Promise.all(code.map((p) => read(p)));
  return code.map((path, i) => ({ path, modules: headerModules(texts[i] ?? ""), test: isTestPath(path) }))
    .filter((f) => f.modules.length);
}

// architectureImpact({ before, after, graph }) -> { id, kind, removedInterfaces, alteredInterfaces, affected, names } —
// before, after: parseArchitecture of the last accepted and of the current text; graph: linkGraph of the commit shown, whose
// modules are read for what follows the decision or uses the module, and whose code files and tests for what names each of
// them. affected [{ id, reasons, breaks, code, tests }]: the users of a removed interface first, marked breaks, then the
// others by identifier, and a changed module itself last; code and tests by path, those of a withdrawn module included.
export function architectureImpact({ before, after, graph }) {
  const id = after.id, affected = new Map();
  const nodes = Object.values(graph?.nodes ?? {}), edges = graph?.edges ?? [];
  const modules = nodes.filter((n) => n.kind === "module");
  const add = (mid, reason, breaks = false) => {
    const a = affected.get(mid) || { id: mid, reasons: [], breaks: false };
    a.reasons.push(reason);
    a.breaks = a.breaks || breaks;
    affected.set(mid, a);
  };
  let removed = [], altered = [];
  if (after.kind === "architecture-decision") {
    for (const m of modules) if (m.follows.includes(id)) add(m.id, `follows ${id}`);
  } else {
    removed = before.provides.filter((i) => !after.provides.includes(i));
    altered = before.provides.filter((i) => after.provides.includes(i) && (before.interfaces[i] ?? "") !== (after.interfaces[i] ?? ""));
    for (const m of modules) {
      if (m.id === id) continue;
      for (const u of m.uses) {
        if (u.module !== id) continue;
        if (removed.includes(u.iface)) add(m.id, `uses ${id}.${u.iface}, which the change removes`, true);
        else if (altered.includes(u.iface)) add(m.id, `uses ${id}.${u.iface}, which the change alters`);
      }
    }
  }
  const order = [...affected.values()].sort((a, b) => Number(b.breaks) - Number(a.breaks) || a.id.localeCompare(b.id));
  if (after.kind === "module") order.push({ id, reasons: ["the changed module itself"], breaks: false });
  // The code files (or tests) whose Module: line names a module, by path — whether the module is live or not.
  const kindOf = new Map(nodes.map((n) => [n.id, n.kind]));
  const files = (mid, test) => [...new Set(edges.filter((e) => e.kind === "module" && e.to === mid
    && kindOf.get(e.from) === (test ? "test" : "code")).map((e) => e.from))].sort();
  const b = before.names, a = after.names;
  return {
    id, kind: after.kind, removedInterfaces: removed, alteredInterfaces: altered,
    affected: order.map((x) => ({ ...x, code: files(x.id, false), tests: files(x.id, true) })),
    names: { kept: a.filter((n) => b.includes(n)), added: a.filter((n) => !b.includes(n)), removed: b.filter((n) => !a.includes(n)) },
  };
}

// ---------------------------------------------------------------- the component diagram (UC-022 step 8, UC-025 step 5)

const mermaidId = (id) => id.replace(/[^A-Za-z0-9]/g, "_");
const mermaidText = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").replace(/"/g, "#quot;").replace(/</g, "#lt;").replace(/>/g, "#gt;");

// A Mermaid flowchart computed from the modules' `uses` and `provides`: one edge per used interface, from the user to the
// provider; an interface that no module provides is drawn as a node of its own, marked missing.
export function componentDiagram(modules) {
  const mods = modules.filter((m) => m.kind === "module");
  const byId = new Map(mods.map((m) => [m.id, m]));
  const lines = ["flowchart LR"], missing = [];
  for (const m of mods) lines.push(`  ${mermaidId(m.id)}["${mermaidText(m.id)}<br/>${mermaidText(m.title)}"]`);
  for (const m of mods) {
    for (const u of m.uses) {
      const p = byId.get(u.module);
      if (p && p.provides.includes(u.iface)) {
        lines.push(`  ${mermaidId(m.id)} -->|"${mermaidText(u.iface)}"| ${mermaidId(p.id)}`);
      } else {
        const node = `missing_${mermaidId(u.module)}_${mermaidId(u.iface)}`;
        if (!missing.includes(node)) missing.push(node);
        lines.push(`  ${mermaidId(m.id)} -.->|"${mermaidText(u.iface)}"| ${node}["${mermaidText(`${u.module}.${u.iface}`)} — missing"]`);
      }
    }
  }
  if (missing.length) {
    lines.push("  classDef missing stroke-dasharray: 4 3,stroke:#b42318,color:#b42318");
    for (const n of missing) lines.push(`  class ${n} missing`);
  }
  return lines.join("\n") + "\n";
}
