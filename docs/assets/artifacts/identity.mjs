// Identity — the identifiers of a repository's artifacts: whether each artifact carries one, whether an identifier survives from
// one version of the repository to the next, and whether each artifact names what it descends from.
// Kernel (ARC-003): pure functions over the files they are given — one version of a repository as { path: text } —; nothing
// is read, sent or stored here.
//
// Module: MOD-artifacts
//
// EVERY ARTIFACT HAS AN IDENTIFIER: a requirement its name in capitals, every other artifact one of
//   SRC-<slug> · UC-<nnn> · ARC-<nnn> · MOD-<slug> · TST-<nnn> · ITM-<nnn> · RES-<slug> · JOB-<id>.
// Where each is found (ARC-006, ARC-020):
//   SPEC.md                                   requirements, `**NAME** *(source)*`
//   docs/use-cases/UC-<nnn>-<slug>.md         use cases — every file of the folder but its README.md
//   docs/architecture/ARC-<nnn>-<slug>.md     decisions — likewise
//   docs/architecture/MOD-<slug>.md           modules
//   docs/backlog/ITM-<nnn>-<slug>.md          backlog items — the folder also holds the order file and sprint records
//   docs/jobs/JOB-<id>.md                     job records — every file of the folder; gate records lie below it
//   docs/sources/SRC-<slug>.md                sources — every file of the folder; their content lies below it
//   a test's cases                            `TST-<nnn>` in each case's name
// A resource entry of docs/resources.md is told by its form only (identifierKind); how an entry carries it is not defined.

import { SLUG, headerModules, isCodePath, isTestPath, parseArchitecture, parseFrontMatter } from "../artifacts.mjs";
import { isRequirementName, parseRequirements } from "./requirements.mjs";
import { headerTags } from "./headers.mjs";

const KINDS = [
  ["source", new RegExp(`^SRC-${SLUG}$`)],
  ["use-case", /^UC-\d{3}$/],
  ["architecture-decision", /^ARC-\d{3}$/],
  ["module", new RegExp(`^MOD-${SLUG}$`)],
  ["test", /^TST-\d{3}$/],
  ["backlog-item", /^ITM-\d{3}$/],
  ["resource", new RegExp(`^RES-${SLUG}$`)],
  ["job", new RegExp(`^JOB-${SLUG}$`)],
];

// identifierKind(id) -> "requirement" | "source" | "use-case" | "architecture-decision" | "module" | "test" | "backlog-item"
// | "resource" | "job" | null — the kind of an identifier from its form; null for anything that is none.
export function identifierKind(id) {
  const s = typeof id === "string" ? id : "";
  if (isRequirementName(s)) return "requirement";
  return KINDS.find(([, re]) => re.test(s))?.[0] ?? null;
}

// The artifact files of one folder: [kind, folder, which files of it are artifacts, the identifier in a file name, how to name
// one, whether the front matter must carry the identifier as `id`].
const FILES = [
  ["use-case", "docs/use-cases/", (n) => n !== "README.md", /^(UC-\d{3})-[^/]+\.md$/, "UC-<nnn>-<slug>.md", true],
  ["architecture", "docs/architecture/", (n) => n !== "README.md",
    new RegExp(`^(ARC-\\d{3})-[^/]+\\.md$|^(MOD-${SLUG})\\.md$`), "ARC-<nnn>-<slug>.md or MOD-<slug>.md", true],
  ["backlog-item", "docs/backlog/", (n) => n.startsWith("ITM"), /^(ITM-\d{3})-[^/]+\.md$/, "ITM-<nnn>-<slug>.md", false],
  ["job", "docs/jobs/", () => true, new RegExp(`^(JOB-${SLUG})\\.md$`), "JOB-<id>.md", false],
  ["source", "docs/sources/", () => true, new RegExp(`^(SRC-${SLUG})\\.md$`), "SRC-<slug>.md", false],
];

const finding = (artifact, line, rule, what, fix) => ({ artifact, line, kind: "error", what, rule, fix });
const HAS_ID = "EVERY ARTIFACT HAS AN IDENTIFIER";
const SURVIVES = "THE NAME IS THE ID AND IT SURVIVES";
const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";

const HEAD = /^\*\*([^*\n]+)\*\*[ \t]+\*\(/gm;
const MALFORMED_CASE = /\bTST-(?!\d{3}\b)[A-Za-z0-9_]+/g;
const lineAt = (text, index) => text.slice(0, index).split("\n").length;
const textOf = (lines) => (lines || []).join("\n").trim();

// The file's name, if the path lies directly in the folder.
function nameIn(path, folder) {
  if (!path.startsWith(folder)) return null;
  const name = path.slice(folder.length);
  return name.endsWith(".md") && !name.includes("/") ? name : null;
}

// identifiers(files) -> { items, problems } — every identifier of one version of a repository: items
// [{ id, kind, path, line, withdrawn, note }], `note` the withdrawal note of a withdrawn requirement, decision or module; and a
// finding for an artifact that carries no identifier, a malformed one, another one than its file name, or one that another
// artifact carries too.
export function identifiers(files) {
  const items = [], problems = [];
  for (const [path, raw] of Object.entries(files ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const text = String(raw ?? "");
    if (path === "SPEC.md") {
      const reqs = parseRequirements(text);
      for (const m of text.matchAll(HEAD)) {
        const name = m[1], line = lineAt(text, m.index);
        if (!isRequirementName(name)) {
          problems.push(finding(path, line, HAS_ID, `the requirement "${name}" has no name in capitals`,
            "name it in capitals — the name is its identifier"));
          continue;
        }
        const r = reqs.get(name);
        items.push({ id: name, kind: "requirement", path, line, withdrawn: Boolean(r?.withdrawn), note: r?.note ?? null });
      }
      continue;
    }
    for (const [kind, folder, isArtifact, pattern, form, idRequired] of FILES) {
      const name = nameIn(path, folder);
      if (!name || !isArtifact(name)) continue;
      const m = pattern.exec(name);
      if (!m) {
        problems.push(finding(path, 1, HAS_ID, `the file name carries no identifier`, `name the file ${form}`));
        break;
      }
      const id = m[1] ?? m[2];
      const { fields } = parseFrontMatter(text);
      if ((idRequired || "id" in fields) && fields.id !== id) {
        problems.push(finding(id, 1, HAS_ID,
          fields.id ? `the front matter carries ${fields.id}, the file name ${id}` : "the front matter carries no id",
          `write id: ${id} in the front matter, or rename the file`));
      }
      let withdrawn = false, note = null;
      if (kind === "architecture") {
        const w = parseArchitecture(path, text).withdrawn;
        withdrawn = Boolean(w);
        note = w?.note || null;
      }
      items.push({ id, kind: identifierKind(id), path, line: 1, withdrawn, note });
      break;
    }
    if (isCodePath(path) && isTestPath(path)) {
      const cases = headerTags(path, text).cases;
      const malformed = [...text.matchAll(MALFORMED_CASE)];
      for (const bad of malformed) {
        problems.push(finding(path, lineAt(text, bad.index), HAS_ID, `${bad[0]} is not TST-<nnn>`,
          "name the test case TST-<nnn>"));
      }
      if (!cases.length && !malformed.length) {
        problems.push(finding(path, 1, HAS_ID, "no test case carries a TST- identifier",
          "put TST-<nnn> in the name of each test case"));
      }
      for (const id of cases) {
        items.push({ id, kind: "test", path, line: lineAt(text, text.indexOf(id)), withdrawn: false, note: null });
      }
    }
  }
  const first = new Map();
  for (const i of items) {
    const at = first.get(i.id);
    if (!at) { first.set(i.id, i); continue; }
    problems.push(finding(i.id, i.line, HAS_ID, `${i.id} is carried by ${at.path}:${at.line} and by ${i.path}:${i.line}`,
      "give the second artifact an identifier of its own — an identifier names one artifact"));
  }
  return { items, problems };
}

// How the withdrawal note of a kind is written: the SPEC's form for a requirement, ARC-020 decision 4 for a decision or module.
const NOTE = {
  "requirement": "keep it, its source saying withdrawn with the date and a line *Withdrawn:* saying why",
  "architecture-decision": "keep the file, with withdrawn: <date> in its front matter and the reason under ## Withdrawn",
  "module": "keep the file, with withdrawn: <date> in its front matter and the reason under ## Withdrawn",
};
const correctionFor = (kind) => NOTE[kind] ?? `keep it — no withdrawal note is defined for a ${kind}`;

// stabilityProblems(earlier, later) -> [finding] — THE NAME IS THE ID AND IT SURVIVES, between two versions of a repository:
// an identifier of the earlier version that the later one does not carry, a withdrawn identifier carried by a live artifact
// again, and a withdrawn identifier without its withdrawal note are errors. Where an identifier stands — its file, its
// section, its line — may change.
export function stabilityProblems(earlier, later) {
  const now = new Map();
  for (const i of identifiers(later).items) if (!now.has(i.id)) now.set(i.id, i);
  const out = [], seen = new Set();
  for (const e of identifiers(earlier).items) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    const n = now.get(e.id);
    if (!n) {
      out.push(finding(e.id, e.line, SURVIVES, `${e.id} stood in ${e.path} and is gone without a withdrawal note`,
        correctionFor(e.kind)));
    } else if (e.withdrawn && !n.withdrawn) {
      out.push(finding(e.id, n.line, SURVIVES, `${e.id} was withdrawn and is used again in ${n.path}`,
        "a withdrawn identifier is never reused — give the artifact a new one"));
    } else if (n.withdrawn && !n.note) {
      out.push(finding(e.id, n.line, SURVIVES, `${e.id} is withdrawn in ${n.path} without its withdrawal note`,
        correctionFor(n.kind)));
    }
  }
  return out;
}

// originProblems(files) -> [finding] — EVERY ARTIFACT NAMES ITS ORIGIN, in one version of a repository: a use case that realises
// nothing, a decision that nothing forces, a module that realises nothing or follows no decision, a code file that names not
// exactly one module, and a test that names not exactly one module, guards nothing, or guards an entry that is neither a
// requirement name nor a use case. A withdrawn decision or module is passed over; a vendored file is not the product's code.
export function originProblems(files) {
  const out = [];
  for (const [path, raw] of Object.entries(files ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const text = String(raw ?? "");
    const name = nameIn(path, "docs/use-cases/");
    if (name && name !== "README.md") {
      const { fields } = parseFrontMatter(text);
      const realises = Array.isArray(fields.realises) ? fields.realises : [];
      if (!realises.length) {
        out.push(finding(fields.id ?? path, 1, ORIGIN, "the use case names no requirement it realises",
          "list the requirements it realises under realises:"));
      }
      continue;
    }
    if (nameIn(path, "docs/architecture/")) {
      const a = parseArchitecture(path, text);
      if (!a.kind || a.withdrawn) continue;
      if (a.kind === "architecture-decision" && !a.names.length) {
        out.push(finding(a.id, 1, ORIGIN, "the decision names nothing that forces it",
          "list the requirements or use cases that force it under forced_by:"));
      }
      if (a.kind === "module" && !a.names.length) {
        out.push(finding(a.id, 1, ORIGIN, "the module names nothing it realises",
          "list the requirements or use cases it realises under realises:"));
      }
      if (a.kind === "module" && !a.follows.length) {
        out.push(finding(a.id, 1, ORIGIN, "the module names no decision it follows",
          "list the architecture decisions it follows under follows:"));
      }
      continue;
    }
    if (!isCodePath(path)) continue;
    const modules = headerModules(text);
    const what = isTestPath(path) ? "the test" : "the code file";
    if (modules.length !== 1) {
      out.push(finding(path, 1, ORIGIN, modules.length ? `${what} names ${modules.length} modules: ${modules.join(", ")}`
        : `${what} names no module`, "name the one module in a line `Module: MOD-<slug>` among its first 20 lines"));
    }
    if (!isTestPath(path)) continue;
    const guards = headerTags(path, text).guards;
    if (!guards.length) {
      out.push(finding(path, 1, ORIGIN, "the test guards nothing",
        "name what it guards in a line `Guards: <NAME>[; <NAME> …]` among its first 20 lines"));
    }
    for (const g of guards) {
      if (!isRequirementName(g) && !/^UC-\d{3}$/.test(g)) {
        out.push(finding(path, 1, ORIGIN, `the test guards "${g}", which is neither a requirement name nor a use case`,
          "name a requirement in capitals, exactly as in the SPEC, or a use case UC-<nnn>"));
      }
    }
  }
  return out;
}
