// Requirements — the requirements of a SPEC or of a queue entry, read by their names, and the format checks of each one.
// Kernel (ARC-003): pure functions over the texts they are given; nothing is read, sent or stored here.
//
// Module: MOD-artifacts
//
// A requirement as the SPEC's form gives it (A REQUIREMENT HAS FIVE FIELDS):
//
//   **NAME IN CAPITALS** *(SRC-…, YYYY-MM-DD)*      — the name, and its source with a date; the source may wrap
//   One rule, one statement.                          — the rule, up to the occasion
//   *Occasion:* why.                                  — may run over several lines
//   *Check:* `tests/…` | no automatic check; at review.
//
// A withdrawn requirement says so in its source and keeps only a line `*Withdrawn:* …`. A requirement ends at a blank line,
// a heading or the next requirement. Sources and resource entries are named by their identifiers (SRC-…, RES-…).

// The slug of an identifier, as artifacts.mjs SLUG — repeated here because artifacts.mjs imports this file.
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";

// A requirement is named by its name in capitals (THE NAME IS THE ID AND IT SURVIVES); other identifiers are not names.
export const isRequirementName = (s) => typeof s === "string" && /[A-Z]/.test(s) && !/[a-z]/.test(s)
  && !/^(UC|ARC|MOD|SRC|TST|ITM|RES|JOB)-/.test(s);

const HEAD = /^\*\*([^*\n]+)\*\*[ \t]+\*\(([\s\S]*?)\)\*/gm;
const FIELD = /^\*(Occasion|Check|Withdrawn):\*[ \t]*(.*)$/;

// The fields of a requirement from the lines after its source, up to its end.
function fieldsOf(rest) {
  const out = { rule: [], occasion: null, check: null, withdrawn: null };
  let into = "rule";
  for (const line of rest.split("\n")) {
    if (!line.trim() || /^#|^---\s*$|^\*\*[^*\n]+\*\*[ \t]+\*\(/.test(line)) break;
    const m = FIELD.exec(line);
    if (m) { into = m[1].toLowerCase(); out[into] = [m[2]]; continue; }
    out[into].push(line);
  }
  const text = (lines) => (lines ? lines.join("\n").trim() : null);
  return { rule: text(out.rule) || null, occasion: text(out.occasion), check: text(out.check), note: text(out.withdrawn) };
}

// parseRequirements(specText) -> Map(name -> { name, withdrawn, source, rule, occasion, check, note, section, line }) — every
// requirement of a SPEC or of a queue entry by its name; withdrawn when its source says so, wherever the source wraps.
// `section` is the heading of level two above it (null in a text without one), `line` the line of its name (from 1).
export function parseRequirements(specText) {
  const text = String(specText ?? ""), out = new Map();
  const heads = [...text.matchAll(HEAD)].filter((m) => isRequirementName(m[1]));
  const sections = [...text.matchAll(/^## (.+)$/gm)];
  let line = 1, at = 0, s = -1;
  heads.forEach((m, i) => {
    for (let k = at; k < m.index; k++) if (text[k] === "\n") line++;
    at = m.index;
    while (s + 1 < sections.length && sections[s + 1].index < m.index) s++;
    const rest = text.slice(m.index + m[0].length, i + 1 < heads.length ? heads[i + 1].index : text.length)
      .replace(/^[ \t]*\n?/, "");
    out.set(m[1], { name: m[1], withdrawn: /withdrawn/i.test(m[2]), source: m[2].trim(), ...fieldsOf(rest),
      section: s < 0 ? null : sections[s][1].trim(), line });
  });
  return out;
}

// ---------------------------------------------------------------- checks

const finding = (r, kind, rule, what, fix) => ({ artifact: r.name, line: r.line, kind, what, rule, fix });
const SOURCE_ID = new RegExp(`\\bSRC-${SLUG}\\b`, "g");
const RESOURCE_ID = new RegExp(`\\bRES-${SLUG}\\b`, "g");
const DATE = /\b\d{4}-\d{2}-\d{2}\b/;
const NAMES_A_TEST = /\btests\/[\w./-]+/;
const AT_REVIEW = /\bat review\b/i;
const CONJUNCTION = /\b(and|additionally)\b/i;

// requirementProblems(requirement, linkedSources) -> [finding] — linkedSources: the identifiers of the sources the product
// links (docs/sources.md), as strings or as { source } entries. A finding is { artifact, line, kind, what, rule, fix }:
// a missing field, a check that names nothing, a source the product does not link and a resource entry named as source are
// errors; a conjunction in the rule is a warning, because whether it states two things is a person's decision. A withdrawn
// requirement keeps only its note and is not checked.
export function requirementProblems(requirement, linkedSources = []) {
  const r = requirement, out = [];
  if (r.withdrawn) return out;
  const FIVE = "A REQUIREMENT HAS FIVE FIELDS";
  if (!r.source || !DATE.test(r.source)) {
    out.push(finding(r, "error", FIVE, "the source has no date", "write the date the source decided, as YYYY-MM-DD"));
  }
  if (!r.rule) out.push(finding(r, "error", FIVE, "no rule", "state the rule as one sentence below the name"));
  if (!r.occasion) out.push(finding(r, "error", FIVE, "no occasion", "add a line *Occasion:* saying why"));
  if (!r.check) out.push(finding(r, "error", FIVE, "no check", "add a line *Check:* naming the test that guards it"));
  else if (!NAMES_A_TEST.test(r.check) && !AT_REVIEW.test(r.check)) {
    out.push(finding(r, "error", "A REQUIREMENT NAMES ITS CHECK", `the check "${r.check}" names no test`,
      "name the test file that guards it (`tests/…`), or write: no automatic check; at review."));
  }
  // A name in backticks is a reference to another requirement, not a conjunction of this rule.
  const conjunction = CONJUNCTION.exec((r.rule ?? "").replace(/`[^`]*`/g, ""));
  if (conjunction) {
    out.push(finding(r, "warning", "ONE STATEMENT PER REQUIREMENT", `the rule contains "${conjunction[1]}"`,
      "split it into two requirements, or give a one-line reason why it states one thing"));
  }
  const source = r.source ?? "";
  const linked = new Set([...linkedSources].map((s) => (typeof s === "string" ? s : s?.source)));
  for (const res of new Set(source.match(RESOURCE_ID) ?? [])) {
    out.push(finding(r, "error", "A RESOURCE'S TERMS ENTER AS A SOURCE", `the source names the resource entry ${res}`,
      "name the registered source of its terms (SRC-…), linked to the product"));
  }
  const sources = [...new Set(source.match(SOURCE_ID) ?? [])];
  const unlinked = sources.filter((s) => !linked.has(s));
  if (!sources.length || unlinked.length) {
    out.push(finding(r, "error", "A REQUIREMENT HAS A REGISTERED SOURCE",
      unlinked.length ? `the product does not link ${unlinked.join(", ")}` : "the source names no registered source",
      "name a source (SRC-…) the product links in docs/sources.md, or link it first"));
  }
  return out;
}
