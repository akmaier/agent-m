// MOD-spec-document — the SPEC and its requirements (docs/architecture/MOD-spec-document.md): its interface. Of it, ITM-206
// builds specSkeleton, the SPEC a new product starts with (ADDING A PRODUCT CREATES ITS LAYOUT, UC-001).
//
// Module: MOD-spec-document
//
// The skeleton is the module's own data file, skeleton.md, read once when the module is loaded (the module file's Files): from
// the disk in Node, from the module's own address in a browser. Nothing else is read here, and nothing is written.

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
