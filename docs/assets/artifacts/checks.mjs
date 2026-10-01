// Format checks — every format check of one kind of artifact in one call, as the findings a drafting job's correction loop
// sends back (ARC-007 decision 3: checks are code, named by data; the named checks a job definition lists are taken from
// here). Kernel (ARC-003): pure functions over the texts they are given; nothing is read, sent or stored here.
//
// Module: MOD-artifacts
//
// formatChecks(kind, text, context) runs the checks the other files of MOD-artifacts define — it adds no second copy of any
// of them — and returns their findings in one shape, the compiler form of MOD-job-harness formatFinding:
//
//   { artifact, line, kind: "error" | "warning", what, rule, fix }  ->  <artifact>:<line>: <kind>: <what> [<RULE>] — <fix>
//
// The kinds and what each runs:
//
//   requirement            a SPEC or a queue entry: every requirement's five fields, its check, its source, one statement
//                          (requirements.mjs requirementProblems), and the names themselves (identity.mjs identifiers)
//   use-case               useCaseProblems (use-cases.mjs), and the identifier the file was opened with
//   architecture-decision  parseArchitecture's problems (artifacts.mjs), each with its rule, line and correction; a diagram
//   module                 stored as an image; the withdrawal note; a module's origin (identity.mjs originProblems); unknown
//                          names; the identifier the file was opened with
//   test                   levelProblems (headers.mjs), originProblems and the TST- identifiers (identity.mjs), unknown names
//                          under Guards:
//   group-file             the hierarchy over the known items (groups.mjs parseGroupFile, hierarchy)
//
// context: { path, knownNames, linkedSources, openedId, items } — each kind reads what it needs:
//   path           the file's path in the repository (docs/use-cases/UC-007-….md, docs/architecture/…, tests/…,
//                  docs/groups/<kind>.md); a requirement needs none
//   knownNames     the product's requirement names (a list, a Set, or the Map parseRequirements gives); without them a name
//                  is checked for its form only
//   linkedSources  requirement: the sources the product links (docs/sources.md), as requirementProblems takes them
//   openedId       use case, decision, module: the identifier the file was opened with (AN EDITED FILE KEEPS ITS IDENTIFIER)
//   items          group file: the known items of its kind, as hierarchy takes them

import { HEADER_LINES, identifierKept, parseArchitecture, parseFrontMatter, reviewedId } from "../artifacts.mjs";
import { isRequirementName, parseRequirements, requirementProblems } from "./requirements.mjs";
import { diagramImages, keyLine, useCaseProblems } from "./use-cases.mjs";
import { headerTags, levelProblems } from "./headers.mjs";
import { identifiers, originProblems } from "./identity.mjs";
import { hierarchy, parseGroupFile } from "./groups.mjs";

// The kinds formatChecks knows, as a job definition names them.
export const FORMAT_KINDS = ["requirement", "use-case", "architecture-decision", "module", "test", "group-file"];

const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";
const KEPT = "AN EDITED FILE KEEPS ITS IDENTIFIER";
const SURVIVES = "THE NAME IS THE ID AND IT SURVIVES";
const MERMAID = "DIAGRAMS ARE MERMAID IN MARKDOWN";

// A finding in exactly the shape of MOD-job-harness formatFinding, whatever the check that made it.
const shape = ({ artifact, line, kind, what, rule, fix }) => ({ artifact, line, kind, what, rule, fix });
const finding = (artifact, line, kind, rule, what, fix) => ({ artifact, line, kind, what, rule, fix });

function nameSet(knownNames) {
  if (knownNames == null) return null;
  return new Set(knownNames instanceof Map ? knownNames.keys() : knownNames);
}

// AN EDITED FILE KEEPS ITS IDENTIFIER: identifierKept decides; the finding names the line of the id.
function keptFindings(openedId, text) {
  if (!openedId || identifierKept(openedId, text) === null) return [];
  const { fields } = parseFrontMatter(text);
  const now = typeof fields.id === "string" && fields.id ? fields.id : null;
  return [finding(openedId, "id" in fields ? keyLine(text, "id") : 1, "error", KEPT,
    `the file was opened as ${openedId}, but the text carries ${now ? `the identifier ${now}` : "no identifier"}`,
    `put back id: ${openedId}; a new identifier is a new file, proposed as such.`)];
}

// ---------------------------------------------------------------- requirement

function requirementChecks(text, context) {
  const out = [];
  // The names themselves (EVERY ARTIFACT HAS AN IDENTIFIER): a requirement whose name is not in capitals, and a name given
  // twice. identifiers reads a SPEC under the path SPEC.md; in a queue entry the places are its lines.
  for (const f of identifiers({ "SPEC.md": text }).problems) out.push({ ...shape(f), what: f.what.replaceAll("SPEC.md:", "line ") });
  for (const r of parseRequirements(text).values()) out.push(...requirementProblems(r, context.linkedSources ?? []).map(shape));
  return out;
}

// ---------------------------------------------------------------- use case

function useCaseChecks(text, context) {
  return [...useCaseProblems(context.path, text, context.knownNames).map(shape), ...keptFindings(context.openedId, text)];
}

// ---------------------------------------------------------------- architecture decision and module

const ARCHITECTURE = {
  "architecture-decision": {
    file: "ONE ARCHITECTURE DECISION, ONE FILE", form: "docs/architecture/ARC-<nnn>-<slug>.md",
    parts: "AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES", noun: "a decision",
    keys: "id, title and forced_by",
  },
  "module": {
    file: "ONE MODULE, ONE FILE", form: "docs/architecture/MOD-<slug>.md",
    parts: "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES", noun: "a module",
    keys: "id, title, realises, follows, uses and provides",
  },
};
// What each list of the front matter holds, and the rule that asks for it.
const LISTS = {
  forced_by: { rule: () => ORIGIN, item: "name a requirement by its name in capitals, as the SPEC writes it, or a use case UC-<nnn>." },
  realises: { rule: () => ORIGIN, item: "name a requirement by its name in capitals, as the SPEC writes it, or a use case UC-<nnn>." },
  follows: { rule: () => ORIGIN, item: "name an architecture decision as ARC-<nnn>." },
  uses: { rule: (a) => a.parts, item: "name an interface of another module as MOD-<slug>.<interface>." },
  provides: { rule: (a) => a.parts, item: "name the interface alone, as its bullet in ## Interfaces begins." },
};

// One problem of parseArchitecture, its file name taken off, as a finding: its rule, its line and the correction. Every
// problem parseArchitecture can give has a row here; a problem without one is still an error, under the file's rule.
function architectureFinding(a, artifact, text, what) {
  const at = (key, item) => keyLine(text, key, item);
  const one = (rule, line, fix) => finding(artifact, line, "error", rule, what, fix);
  let m;
  if (/^not docs\/architecture\//.test(what)) return one(a.file, 1, `name the file ${a.form}.`);
  if (what === "no front matter") {
    return one(a.file, 1, `begin the file with a --- block naming ${a.keys}, closed by a line ---.`);
  }
  if ((m = /^id .* does not match the file name \((.*)\)$/.exec(what))) {
    return one(a.file, at("id"), `set id: ${m[1]}, the identifier the file name gives; ${a.noun} keeps its identifier.`);
  }
  if (what === "missing title") return one(a.parts, at("title"), "add a line title: <text> to the front matter.");
  if ((m = /^(\w+) must be a list$/.exec(what))) {
    return one(LISTS[m[1]]?.rule(a) ?? a.file, at(m[1]),
      `write ${m[1]}: as a list, one item per line as   - <item>, or ${m[1]}: [] when it holds nothing.`);
  }
  if ((m = /^(\w+) must name at least one item$/.exec(what))) {
    return one(LISTS[m[1]]?.rule(a) ?? a.file, at(m[1]), `list at least one requirement name or use case (UC-<nnn>) under ${m[1]}:.`);
  }
  if ((m = /^(\w+): (".*") is not .*$/.exec(what))) {
    return one(LISTS[m[1]]?.rule(a) ?? a.file, at(m[1], JSON.parse(m[2])), LISTS[m[1]]?.item ?? `correct the item under ${m[1]}:.`);
  }
  if ((m = /^key (\w+) belongs to (?:a module|an architecture decision)$/.exec(what))) {
    return one(a.file, at(m[1]), `remove ${m[1]}: — it belongs to the other kind of architecture file, not to ${a.noun}.`);
  }
  if (what === "provides names an interface twice") return one(a.parts, at("provides"), "list each interface once under provides:.");
  if ((m = /^interface (\w+) is not described in ## Interfaces$/.exec(what))) {
    return one(a.parts, at("provides", m[1]),
      `describe ${m[1]} in ## Interfaces by a bullet - \`${m[1]}(…) -> …\` — …, or remove it from provides:.`);
  }
  if ((m = /^missing section (.*)$/.exec(what))) return one(a.parts, 1, `add the section ${m[1]} to the file.`);
  return one(a.file, 1, `correct the file as ${a.form} requires.`);
}

function architectureChecks(kind, text, context) {
  const a = ARCHITECTURE[kind], path = String(context.path ?? "");
  const name = path.split("/").pop();
  const parsed = parseArchitecture(path, text);
  const artifact = reviewedId(path) ?? name;
  const out = [];
  if (parsed.kind && parsed.kind !== kind) {
    out.push(finding(artifact, 1, "error", a.file, `the file is ${ARCHITECTURE[parsed.kind].noun}, not ${a.noun}`,
      `name the file ${a.form}, or check it as ${ARCHITECTURE[parsed.kind].noun}.`));
    return out;
  }
  const problems = parsed.problems.map((p) => (p.startsWith(`${name}: `) ? p.slice(name.length + 2) : p));
  if (problems.includes("no front matter")) {
    // Without a front matter every key is missing; as for a use case, the file's form is named and nothing more.
    return problems.filter((p) => /^not docs\/architecture\/|^no front matter$/.test(p))
      .map((p) => architectureFinding(a, artifact, text, p));
  }
  for (const p of problems) out.push(architectureFinding(a, artifact, text, p));
  const known = nameSet(context.knownNames);
  const key = kind === "module" ? "realises" : "forced_by";
  if (known) {
    for (const n of parsed.requirements) {
      if (isRequirementName(n) && !known.has(n)) {
        out.push(finding(artifact, keyLine(text, key, n), "error", ORIGIN, `${key} "${n}" matches no requirement`,
          "use an existing name or remove the line."));
      }
    }
  }
  if (kind === "module") {
    // A module realises something and follows a decision (originProblems; a decision's forced_by is parseArchitecture's).
    for (const f of originProblems({ [path]: text })) {
      out.push({ ...shape(f), artifact, line: keyLine(text, /realises/.test(f.what) ? "realises" : "follows") });
    }
  }
  const { body } = parseFrontMatter(text);
  const bodyStart = text.length - body.length;
  for (const img of diagramImages(body)) {
    out.push(finding(artifact, text.slice(0, bodyStart + img.index).split("\n").length, "error", MERMAID,
      `diagram stored as an image file (${img.target})`, "replace the image by the same diagram as a ```mermaid block in this file."));
  }
  if (parsed.withdrawn && !parsed.withdrawn.note) {
    out.push(finding(artifact, keyLine(text, "withdrawn"), "error", SURVIVES,
      `withdrawn on ${parsed.withdrawn.date} without the reason under ## Withdrawn`,
      "add the section ## Withdrawn with the reason as its first paragraph; the file and its identifier stay."));
  }
  out.push(...keptFindings(context.openedId, text));
  return out;
}

// ---------------------------------------------------------------- test

function testChecks(text, context) {
  const path = String(context.path ?? "");
  const files = { [path]: text };
  const out = [...levelProblems(path, text), ...originProblems(files), ...identifiers(files).problems].map(shape);
  const known = nameSet(context.knownNames);
  if (known) {
    const line = String(text).split("\n").slice(0, HEADER_LINES).findIndex((l) => /Guards:/.test(l)) + 1 || 1;
    for (const g of headerTags(path, text).guards) {
      if (isRequirementName(g) && !known.has(g)) {
        out.push(finding(path, line, "error", ORIGIN, `the test guards "${g}", which matches no requirement`,
          "name a requirement exactly as the SPEC writes it, or remove it from Guards:."));
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- group file

function groupFileChecks(text, context) {
  // A problem of a group file concerns that file: its line is the file's line, so the file is the artifact named.
  return hierarchy(parseGroupFile(text), context.items).problems.map((f) => ({ ...shape(f), artifact: context.path ?? f.artifact }));
}

// ---------------------------------------------------------------- the one call

// formatChecks(kind, text, context) -> [finding] — every format check of one kind of artifact at once, each finding naming
// the artifact, the line, its kind (error or warning), what is wrong, the rule by name and the expected correction. An
// unknown kind is a fault of the caller and throws, naming the kinds there are.
export function formatChecks(kind, text, context = {}) {
  const t = String(text ?? ""), c = context ?? {};
  switch (kind) {
    case "requirement": return requirementChecks(t, c);
    case "use-case": return useCaseChecks(t, c);
    case "architecture-decision":
    case "module": return architectureChecks(kind, t, c);
    case "test": return testChecks(t, c);
    case "group-file": return groupFileChecks(t, c);
    default: throw new TypeError(`formatChecks: unknown kind ${JSON.stringify(kind)} — one of ${FORMAT_KINDS.join(", ")}`);
  }
}
