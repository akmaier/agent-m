// MOD-spec-document — the SPEC and its requirements (docs/architecture/MOD-spec-document.md): its interface. Of it, ITM-206
// builds specSkeleton, the SPEC a new product starts with (ADDING A PRODUCT CREATES ITS LAYOUT, UC-001), and ITM-214 builds
// parseSpec, with Spec, SpecSection and Requirement, the SPEC read in its form (A REQUIREMENT HAS FOUR FIELDS, UC-002).
//
// Module: MOD-spec-document
//
// The skeleton is the module's own data file, skeleton.md, read once when the module is loaded (the module file's Files): from
// the disk in Node, from the module's own address in a browser. Nothing else is read here, and nothing is written. Every other
// file of this folder is private to the module.

/**
 * A SPEC as parseSpec reads it: the title, the sections in the order they stand, and the requirements by name, in the order
 * they stand.
 * @typedef {{ title: string, sections: SpecSection[], requirements: Map<string, Requirement> }} Spec
 */

/**
 * A section: its heading line, the number of that line (from 1), its range in the text — `text.slice(start, end)` is its
 * exact text, from its heading line up to the next heading of level two or to the end —, and the names of its requirements
 * in order.
 * @typedef {{ heading: string, line: number, start: number, end: number, requirements: string[] }} SpecSection
 */

/**
 * A requirement: its name; its source as written between `*(` and `)*`, and `sources`, its items split at `;` and trimmed;
 * its rule; its check, and `checkPaths`, the paths of the tests the check names; the heading line of its section; the number
 * of its head line (from 1). A source, rule or check that is missing is null, and so is the section of a requirement that
 * stands in none. What it constrains is not a field: it follows from the SPEC it stands in.
 * @typedef {{ name: string, source: string | null, sources: string[], rule: string | null, check: string | null,
 *   checkPaths: string[], section: string | null, line: number }} Requirement
 */

export { parseSpec } from "./parse.mjs";

// Where the product's name stands in skeleton.md.
const PRODUCT = "<product>";

const SKELETON_FILE = new URL("./skeleton.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");
const SKELETON = disk ? disk.readFileSync(SKELETON_FILE, "utf8") : await ownFile(SKELETON_FILE);

// In a browser: the module's own file, from the address the module itself was loaded from.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`MOD-spec-document: its skeleton.md was not served (${answer.status} for ${url.pathname})`);
  return answer.text();
}

// specSkeleton(product: string) -> string — the SPEC a new product starts with: its title `# <product> — Specification`, a
// preamble saying what a requirement is in this form, and an empty first section. product: the product's name, such as
// the path of its repository.
export function specSkeleton(product) {
  return SKELETON.split(PRODUCT).join(String(product));
}
