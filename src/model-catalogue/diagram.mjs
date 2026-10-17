// Mermaid text of the supplied process model; no state, loading or writes.
// Module: MOD-model-catalogue

// Quoted Mermaid labels keep supplied text from becoming syntax.
const label = (text) => String(text).replace(/[\r\n]+/g, " ")
  .replace(/["<>|]/g, (character) => ({ '"': "#quot;", "<": "#lt;", ">": "#gt;", "|": "#124;" })[character]);

/**
 * @param {Model} model - the module's public Model, documented in index.mjs.
 * @returns {string} Mermaid text of its phases, transitions, verification pairs and gates.
 */
export function modelDiagram(model) {
  const ids = new Map(model.phases.map((phase, index) => [phase.name, `P${index}`]));
  const lines = ["flowchart LR"];
  for (const phase of model.phases) {
    lines.push(`  ${ids.get(phase.name)}["${label(phase.name)}"]`);
  }
  for (const transition of model.transitions) {
    lines.push(`  ${ids.get(transition.from)} -->|"${label(transition.kind)}"| ${ids.get(transition.to)}`);
  }
  for (const pair of model.pairs) {
    lines.push(`  ${ids.get(pair.phase)} -.->|"verification: checked by"| ${ids.get(pair.checkedBy)}`);
  }
  for (const [index, gate] of model.gates.entries()) {
    const id = `G${index}`;
    lines.push(`  ${id}{"Gate: ${label(gate.artifacts)}<br/>Condition: ${label(gate.condition)}<br/>Decider: ${label(gate.decider)}"}`,
      `  ${ids.get(gate.from)} --> ${id}`, `  ${id} --> ${ids.get(gate.to)}`);
  }
  return lines.join("\n") + "\n";
}
