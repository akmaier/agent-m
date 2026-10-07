// The component diagram of the modules view (UC-025 step 5, 5a), as Mermaid: one box per module inside the box of its
// subsystem, one arrow per module it uses, a used module that has no file as a box marked missing, a used interface that an
// existing module does not provide marked missing on that module's own box, and a module a gap of step 4 names marked as
// such. Pure: computed from the module files and gaps it is given whenever it is shown, never stored (THE TRACEABILITY
// MATRIX IS DERIVED).
//
// Module: MOD-trace-pages

// The Mermaid node of an identifier: its letters and digits, every other character an underscore.
const nodeId = (id) => String(id).replace(/[^A-Za-z0-9]/g, "_");
// Text inside a quoted Mermaid label, on one line, with no quote that could end the label and no angle bracket of a tag.
const label = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").replace(/"/g, "#quot;").replace(/</g, "#lt;").replace(/>/g, "#gt;");
const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// componentDiagram(files, gaps) -> the Mermaid text of a flowchart, ending in a newline. files: architecture files as
// parseArchitecture (docs/assets/artifacts.mjs) reads them; those of kind "module" are drawn, each { id, title, follows, uses,
// provides } with follows the decisions it follows, uses [{ module, iface }] the interfaces of other modules it uses, and
// provides the interfaces it provides itself. gaps: the module gaps of UC-025 step 4, as MOD-trace-graph's moduleRows returns
// them — each { artifact, … } naming the module it concerns; defaults to none, as every call before ITM-210 made it.
// - One box per module, showing its identifier and title, inside the box of its subsystem: the first decision it follows. A
//   module that follows none stands outside every subsystem's box.
// - One arrow from a module to each module it uses, however many of that module's interfaces it uses; no labels, so that the
//   text grows with the pairs and not with the interfaces (Mermaid refuses a text above 50,000 characters).
// - A used module that has no file is one box outside every subsystem, marked missing — dashed and red.
// - A used module that has a file but does not provide a used interface keeps its own box — it is not redrawn — marked
//   missing the same way (UC-025 5a: an interface no module provides, whether or not the module itself exists).
// - A module a gap names (by `artifact`, matched to a drawn module) is marked on its own box, dashed and amber — whichever
//   gaps step 4 lists; a gap naming no drawn module, and a module no gap names, mark nothing. Several gaps naming the same
//   module mark it once.
export function componentDiagram(files, gaps = []) {
  const modules = new Map();
  for (const f of files) if (f.kind === "module" && !modules.has(f.id)) modules.set(f.id, f);
  const ids = [...modules.keys()].sort(byCodePoint);
  const subsystems = new Map(), outside = [];
  for (const id of ids) {
    const first = modules.get(id).follows?.[0];
    if (first) subsystems.set(first, [...(subsystems.get(first) ?? []), id]);
    else outside.push(id);
  }
  const arrows = [], missingModules = new Set(), missingInterfaces = new Set();
  for (const id of ids) {
    const uses = modules.get(id).uses ?? [];
    for (const used of [...new Set(uses.map((u) => u.module))].sort(byCodePoint)) {
      arrows.push(`  ${nodeId(id)} --> ${nodeId(used)}`);
      if (!modules.has(used)) missingModules.add(used);
    }
    for (const u of uses) {
      const target = modules.get(u.module);
      if (target && !(target.provides ?? []).includes(u.iface)) missingInterfaces.add(u.module);
    }
  }
  const box = (id) => `${nodeId(id)}["${label(id)}<br/>${label(modules.get(id).title)}"]`;
  const lines = ["flowchart LR"];
  for (const s of [...subsystems.keys()].sort(byCodePoint)) {
    lines.push(`  subgraph S_${nodeId(s)}["${label(s)}"]`, ...subsystems.get(s).map((id) => `    ${box(id)}`), "  end");
  }
  for (const id of outside) lines.push(`  ${box(id)}`);
  const gone = [...missingModules].sort(byCodePoint);
  for (const id of gone) lines.push(`  ${nodeId(id)}["${label(id)} — missing"]`);
  lines.push(...arrows);
  const missingMarked = [...new Set([...gone, ...missingInterfaces])].sort(byCodePoint);
  if (missingMarked.length) {
    lines.push("  classDef missing stroke-dasharray: 4 3,stroke:#b42318,color:#b42318");
    for (const id of missingMarked) lines.push(`  class ${nodeId(id)} missing`);
  }
  const gapped = [...new Set(gaps.map((g) => g.artifact).filter((id) => modules.has(id)))].sort(byCodePoint);
  if (gapped.length) {
    lines.push("  classDef gap stroke-dasharray: 4 3,stroke:#b78105,color:#b78105");
    for (const id of gapped) lines.push(`  class ${nodeId(id)} gap`);
  }
  return lines.join("\n") + "\n";
}
