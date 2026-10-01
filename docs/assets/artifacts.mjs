// Artifacts — the text formats of the review layout, read and checked in one place: front matter, the identifiers and kinds of
// reviewed files, architecture decisions and modules, the requirements of a SPEC, and the `Module:` header of code and tests.
// Kernel (ARC-003): pure functions over texts it is given; it reads nothing itself, imports no other module, and decides
// nothing about status, traceability or acceptance.
//
// Module: MOD-artifacts

// ---------------------------------------------------------------- use-case front matter

export function parseFrontMatter(text) {
  if (!text.startsWith("---\n")) return { fields: {}, body: text };
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) return { fields: {}, body: text };
  const fields = {};
  let key = null;
  for (const line of text.slice(4, end).split("\n")) {
    const m = line.match(/^([a-z][a-z0-9_-]*):\s*(.*)$/);
    if (m) {
      key = m[1];
      fields[key] = m[2].trim() ? m[2].trim() : [];
    } else if (key && /^\s+-\s+/.test(line) && Array.isArray(fields[key])) {
      fields[key].push(line.replace(/^\s+-\s+/, "").trim());
    }
  }
  return { fields, body: text.slice(end + 5) };
}

// ---------------------------------------------------------------- identifiers and kinds of reviewed files

const REVIEWED_ID = /^([A-Z]+-\d{3,})-[^/]*\.md$/;
// ONE MODULE, ONE FILE: docs/architecture/MOD-<slug>.md — the whole slug is the module's identifier.
export const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const MODULE_ID = new RegExp(`^(MOD-${SLUG})\\.md$`);

// The identifier of a reviewed file from its path (docs/use-cases/UC-010-<slug>.md -> UC-010,
// docs/architecture/ARC-003-<slug>.md -> ARC-003, docs/architecture/MOD-review-core.md -> MOD-review-core), or null.
export function reviewedId(path) {
  const name = String(path ?? "").split("/").pop();
  if (name.startsWith("MOD-")) return MODULE_ID.exec(name)?.[1] ?? null;
  const m = REVIEWED_ID.exec(name);
  return m ? m[1] : null;
}

// ONE REVIEW LAYOUT FOR EVERY PRODUCT: the kinds of reviewed file, each in its folder below docs/, named as its rule says
// (ONE USE CASE, ONE FILE · ONE ARCHITECTURE DECISION, ONE FILE · ONE MODULE, ONE FILE). The kind is the record's `kind`.
const REVIEWED_KINDS = [
  ["use-case", /^docs\/use-cases\/UC-\d{3}-[^/]+\.md$/],
  ["architecture-decision", new RegExp(`^docs/architecture/ARC-\\d{3}-${SLUG}\\.md$`)],
  ["module", new RegExp(`^docs/architecture/MOD-${SLUG}\\.md$`)],
];
export const kindOfPath = (path) => REVIEWED_KINDS.find(([, re]) => re.test(String(path ?? "")))?.[0] ?? null;
export const ARCHITECTURE_FILE = new RegExp(`^docs/architecture/(?:ARC-\\d{3}-${SLUG}|MOD-${SLUG})\\.md$`);

// ---------------------------------------------------------------- architecture (SPEC §11; UC-022, UC-023)
//
// ONE ARCHITECTURE DECISION, ONE FILE: docs/architecture/ARC-<nnn>-<slug>.md. ONE MODULE, ONE FILE:
// docs/architecture/MOD-<slug>.md. Both are reviewed like use cases (ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON); the
// format is checked by tests/artifact_checks.py architecture_problems, which reads it the same way:
//
//   ARC — front matter: id (ARC-<nnn>), title, forced_by (a list of requirement names and UC-<nnn>, at least one);
//         body sections ## Context, ## Decision, ## Alternatives, ## Consequences.
//   MOD — front matter: id (MOD-<slug>), title, realises (requirement names and UC-<nnn>), follows (ARC-<nnn>),
//         uses (MOD-<slug>.<interface>), provides (interface names) — each a list, possibly empty (`key:` or `key: []`);
//         body sections ## Responsibility, ## Interfaces; each provided interface described in ## Interfaces by a
//         bullet that starts with its name in backticks, `- \`name(…) -> …\` — …`, continued on indented lines.

const UC_ID = /^UC-\d{3}$/;
const ARC_ID = /^ARC-\d{3}$/;
const IFACE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const USE_RE = new RegExp(`^(MOD-${SLUG})\\.([A-Za-z_][A-Za-z0-9_]*)$`);
const ARC_SECTIONS = ["## Context", "## Decision", "## Alternatives", "## Consequences"];
const MOD_SECTIONS = ["## Responsibility", "## Interfaces"];

// A requirement is named by its name in capitals (THE NAME IS THE ID AND IT SURVIVES); other identifiers are not names.
export const isRequirementName = (s) => typeof s === "string" && /[A-Z]/.test(s) && !/[a-z]/.test(s)
  && !/^(UC|ARC|MOD|SRC|TST|ITM|RES|JOB)-/.test(s);

const asList = (v) => (v === "[]" ? [] : Array.isArray(v) ? v : null);

function sectionOf(body, heading) {
  const lines = body.split("\n");
  const at = lines.findIndex((l) => l.trimEnd() === heading);
  if (at < 0) return null;
  const end = lines.findIndex((l, i) => i > at && /^#{1,2} /.test(l));
  return lines.slice(at + 1, end < 0 ? lines.length : end);
}

// { name: its description } from the ## Interfaces section: a bullet `- \`name…` and the indented lines that continue it.
function describedInterfaces(body) {
  const out = {}, lines = sectionOf(body, "## Interfaces") || [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^- `([A-Za-z_][A-Za-z0-9_]*)/.exec(lines[i]);
    if (!m) continue;
    const desc = [lines[i]];
    while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) desc.push(lines[++i]);
    out[m[1]] = desc.map((l) => l.trimEnd()).join("\n");
  }
  return out;
}

// An architecture file as the dashboard reads it -> { kind, id, title, names, requirements, useCases, follows, uses,
// provides, interfaces, body, problems }. `names` are what forces a decision (forced_by) or what a module realises.
export function parseArchitecture(path, text) {
  const name = String(path).split("/").pop();
  const kind = kindOfPath(path);
  const { fields, body } = parseFrontMatter(String(text));
  const problems = [];
  const want = reviewedId(path);
  if (kind !== "architecture-decision" && kind !== "module") problems.push(`${name}: not docs/architecture/ARC-<nnn>-<slug>.md or MOD-<slug>.md`);
  if (!Object.keys(fields).length) problems.push(`${name}: no front matter`);
  if (fields.id !== want) problems.push(`${name}: id ${JSON.stringify(fields.id ?? null)} does not match the file name (${want})`);
  if (!fields.title || typeof fields.title !== "string") problems.push(`${name}: missing title`);
  const list = (key, ok, what, nonEmpty = false) => {
    const v = key in fields ? asList(fields[key]) : null;
    if (v === null) { problems.push(`${name}: ${key} must be a list`); return []; }
    if (nonEmpty && !v.length) problems.push(`${name}: ${key} must name at least one item`);
    for (const x of v) if (!ok(x)) problems.push(`${name}: ${key}: ${JSON.stringify(x)} is not ${what}`);
    return v;
  };
  const origin = (x) => UC_ID.test(x) || isRequirementName(x);
  let names = [], follows = [], uses = [], provides = [];
  const interfaces = describedInterfaces(body);
  if (kind === "architecture-decision") {
    names = list("forced_by", origin, "a use case (UC-<nnn>) or a requirement name", true);
    for (const k of ["realises", "follows", "uses", "provides"]) if (k in fields) problems.push(`${name}: key ${k} belongs to a module`);
  } else if (kind === "module") {
    names = list("realises", origin, "a use case (UC-<nnn>) or a requirement name");
    follows = list("follows", (x) => ARC_ID.test(x), "an architecture decision (ARC-<nnn>)");
    uses = list("uses", (x) => USE_RE.test(x), "an interface of another module (MOD-<slug>.<interface>)")
      .filter((x) => USE_RE.test(x)).map((x) => { const m = USE_RE.exec(x); return { module: m[1], iface: m[2] }; });
    provides = list("provides", (x) => IFACE.test(x), "an interface name");
    if ("forced_by" in fields) problems.push(`${name}: key forced_by belongs to an architecture decision`);
    if (new Set(provides).size !== provides.length) problems.push(`${name}: provides names an interface twice`);
    for (const i of provides) if (IFACE.test(i) && !(i in interfaces)) problems.push(`${name}: interface ${i} is not described in ## Interfaces`);
  }
  for (const s of kind === "module" ? MOD_SECTIONS : kind ? ARC_SECTIONS : []) {
    if (!body.split("\n").some((l) => l.trimEnd() === s)) problems.push(`${name}: missing section ${s}`);
  }
  // ARC-020 decision 4: a withdrawn decision or module keeps its file, with `withdrawn: <date>`, perhaps `replaced_by`, and the
  // reason as the section ## Withdrawn.
  const withdrawn = typeof fields.withdrawn === "string" && fields.withdrawn
    ? { date: fields.withdrawn, replacedBy: typeof fields.replaced_by === "string" && fields.replaced_by ? fields.replaced_by : null,
      note: (sectionOf(body, "## Withdrawn") || []).join("\n").trim() }
    : null;
  return { kind, id: fields.id ?? want, title: typeof fields.title === "string" ? fields.title : "", names,
    requirements: names.filter((n) => !UC_ID.test(n)), useCases: names.filter((n) => UC_ID.test(n)), follows, uses, provides,
    interfaces, body, problems, withdrawn };
}

// The requirements of a SPEC: a line `**NAME** *(source)*`, the name in capitals; withdrawn when its source says so — the
// source may run over several lines. -> Map(name -> { withdrawn })
export function specRequirements(specText) {
  const out = new Map();
  for (const m of String(specText).matchAll(/^\*\*([^*\n]+)\*\*[ \t]+\*\(([\s\S]*?)\)\*/gm)) {
    if (!isRequirementName(m[1])) continue;
    out.set(m[1], { withdrawn: /withdrawn/i.test(m[2]) });
  }
  return out;
}

// ---------------------------------------------------------------- code and test headers (ARC-020 decision 1, UC-024 step 7)
//
// A code file names its module in a header line `Module: MOD-<slug>` among its first lines.

export const HEADER_LINES = 20;
const CODE_EXT = new Set(["js", "mjs", "cjs", "ts", "tsx", "jsx", "mts", "cts", "py", "rb", "go", "rs", "java", "kt", "kts", "scala",
  "c", "h", "cc", "cpp", "hpp", "cs", "swift", "m", "php", "pl", "lua", "r", "jl", "sh", "bash", "zsh", "ps1", "sql", "css", "scss",
  "html", "vue", "svelte", "dart", "ex", "exs", "erl", "hs", "ml", "fs", "clj"]);
const NOT_OWN = new Set(["vendor", "node_modules", "third_party", "third-party", ".git"]);

export function isCodePath(path) {
  const parts = String(path).split("/"), ext = /\.([A-Za-z0-9]+)$/.exec(parts[parts.length - 1])?.[1]?.toLowerCase();
  return Boolean(ext && CODE_EXT.has(ext)) && !parts.slice(0, -1).some((p) => NOT_OWN.has(p));
}

export function isTestPath(path) {
  const parts = String(path).split("/"), base = parts[parts.length - 1];
  return parts.slice(0, -1).some((p) => ["test", "tests", "__tests__"].includes(p))
    || /^test_[^/]+$|_test\.[A-Za-z0-9]+$|\.(test|spec)\.[A-Za-z0-9]+$/.test(base);
}

// The modules a file names in its header: a line of its first lines that is `Module: MOD-<slug>` behind a comment marker.
export function headerModules(text) {
  const out = [];
  for (const l of String(text).split("\n").slice(0, HEADER_LINES)) {
    const m = new RegExp(`^[^A-Za-z0-9'"\`]*Module:\\s*(MOD-${SLUG})\\b`).exec(l);
    if (m && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

// AN EDITED FILE KEEPS ITS IDENTIFIER: a text whose front matter carries another identifier than the one the file was opened
// with is refused — the refusal's text, or null. openedId null: a file without an identifier, such as a SPEC proposal.
export function identifierKept(openedId, text) {
  if (!openedId) return null;
  const now = parseFrontMatter(String(text)).fields.id ?? null;
  if (now === openedId) return null;
  return `The file was opened as ${openedId}, but the text now carries the identifier ${now ?? "(none)"} — an edited file keeps its ` +
    "identifier. Nothing was saved; put the identifier back, or propose a new file for a new one.";
}
