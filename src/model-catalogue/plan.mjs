// The requirement/phase grid of a planned model, derived only from the supplied inputs.
// Module: MOD-model-catalogue

/**
 * @param {string[]} requirements
 * @param {Model} model - the module's public Model, documented in index.mjs.
 * @returns {{ entries: Array<{ requirement: string, phase: string }>, count: string }}
 * @throws {Error} NotPlanned for a pulled model.
 */
export function planGrid(requirements, model) {
  if (model.kind === "pulled") throw Object.assign(new Error("NotPlanned"), { name: "NotPlanned" });
  const entries = requirements.flatMap((requirement) => model.phases.map(({ name: phase }) => ({ requirement, phase })));
  return { entries, count: `${requirements.length} requirements \u00d7 ${model.phases.length} phases = ${entries.length} plan entries` };
}
