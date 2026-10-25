// scheme.mjs — the pattern of each kind (MOD-identifiers' Data: docs/architecture/MOD-identifiers.md), the kind of a string by
// them, the identifiers a text writes, and the next identifier of a kind.
//
// Module: MOD-identifiers
//
// A slug is lowercase letters and digits in words joined by single hyphens.
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";

// A requirement: a name in capitals — one line with at least one capital, no lowercase letter, no space at either end, and
// no prefix of a kind below; a string such as UC-022 is that kind, never a requirement. Any other character stands in a name
// in capitals, such as the dot of AGENTS.MD.
const REQUIREMENT = /^(?!(?:SRC|UC|ARC|MOD|TST|ITM|RES|JOB)-)(?=[^a-z\n]*[A-Z])[^a-z\s](?:[^a-z\n]*[^a-z\s])?$/;

// The scheme, in the order the module file's Data table lists it: requirement, then each prefixed kind. UC and ITM take
// three or more digits; ARC and TST take exactly three, as the table's own examples do (ARC-048, TST-014).
// JOB's id is an eight-digit date, a four-digit time and four hexadecimal digits, each joined by a hyphen.
const SCHEME = [
  ["requirement", REQUIREMENT],
  ["SRC", new RegExp(`^SRC-${SLUG}$`)],
  ["UC", /^UC-\d{3,}$/],
  ["ARC", /^ARC-\d{3}$/],
  ["MOD", new RegExp(`^MOD-${SLUG}$`)],
  ["TST", /^TST-\d{3}$/],
  ["ITM", /^ITM-\d{3,}$/],
  ["RES", new RegExp(`^RES-${SLUG}$`)],
  ["JOB", /^JOB-\d{8}-\d{4}-[0-9a-f]{4}$/],
];

// kindOfIdentifier(id) -> IdentifierKind | null — the kind of a string by the scheme, or null when it is no identifier.
export function kindOfIdentifier(id) {
  for (const [kind, pattern] of SCHEME) if (pattern.test(id)) return kind;
  return null;
}

// ---------------------------------------------------------------- the identifiers a text writes

// A prefixed identifier stands as a word of its own: a run of letters, digits and hyphens that the scheme names. So UC-007 in
// "UC-007 step 5" is found, and the file name UC-007-derive-use-cases.md, whose run is another string, is not.
const RUN = /[A-Za-z0-9-]+/g;
// A requirement's name between backticks.
const CODE_SPAN = /`([^`\n]+)`/g;
// The bold head of a requirement, as the SPEC writes it: `**NAME** *(source)*` at the start of a line. A bold word without a
// source behind it, such as the `**REGISTER**` under a document's title, heads no requirement.
const BOLD_HEAD = /^\*\*([^*\n]+)\*\*[ \t]+\*\(/;
// A list item of the front matter: `  - item`.
const LIST_ITEM = /^[ \t]+-[ \t]+(.*)$/;

// identifiersIn(path, text) -> IdentifierPlace[] — every identifier a text writes, by the scheme, each with its line (from 1):
// one place for every occurrence, in the order of the text. An identifier of a prefixed kind is found wherever it stands; a
// requirement's name only where a text writes a name — between backticks, as a list item of the front matter, or as the bold
// head of a requirement —, never in prose. It does not say whether a place defines the identifier or refers to it.
export function identifiersIn(path, text) {
  const lines = String(text ?? "").split(/\r?\n/);
  // The front matter lies between the first line, when it is `---`, and the next line `---`; without that closing line there
  // is none.
  const closing = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
  const places = [];
  lines.forEach((line, i) => {
    const found = [];
    for (const m of line.matchAll(RUN)) {
      const kind = kindOfIdentifier(m[0]);
      if (kind !== null && kind !== "requirement") found.push({ at: m.index, id: m[0], kind });
    }
    const names = [...line.matchAll(CODE_SPAN)].map((m) => ({ at: m.index, id: m[1] }));
    const head = BOLD_HEAD.exec(line);
    if (head) names.push({ at: 0, id: head[1] });
    const item = i > 0 && i < closing ? LIST_ITEM.exec(line) : null;
    if (item) names.push({ at: line.indexOf("-"), id: item[1].trim() });
    for (const { at, id } of names) if (kindOfIdentifier(id) === "requirement") found.push({ at, id, kind: "requirement" });
    found.sort((a, b) => a.at - b.at);
    for (const { id, kind } of found) places.push({ id, kind, path, line: i + 1 });
  });
  return places;
}

// ---------------------------------------------------------------- the next identifier of a kind

// The kinds nextIdentifier gives an identifier of (MOD-identifiers' Interfaces): the numbered ones, which count up, and the ones
// named by a slug that a person or a participant chooses.
const NUMBERED = ["UC", "ARC", "TST", "ITM"];
const SLUGGED = ["SRC", "MOD", "RES"];

// nextIdentifier(kind, everUsed, slug?) -> string — the identifier a new artifact of the kind gets. For a numbered kind: one more
// than the highest number of that kind in `everUsed`, written with three digits at least; an entry of another kind, or one that
// is no identifier by the scheme, has no number of this kind. For a slug kind: `<kind>-<slug>`. `everUsed` is read once, so any
// Iterable<string> will do, and is never left out: it holds what the version history knows, the withdrawn identifiers among them,
// which no file holds any longer.
// Throws IdentifierTaken, naming the identifier, when a slug kind's identifier is in `everUsed`; TypeError for a kind outside the
// seven, and for a slug kind without a slug or with a slug that breaks the scheme (the identifier it would make is not one of the
// kind by kindOfIdentifier); and RangeError where the next number of ARC or TST would need a fourth digit, which the scheme
// does not give those kinds — an identifier that kindOfIdentifier rejects is none to give.
export function nextIdentifier(kind, everUsed, slug) {
  if (NUMBERED.includes(kind)) {
    let highest = 0;
    for (const used of everUsed) {
      if (kindOfIdentifier(used) === kind) highest = Math.max(highest, Number(used.slice(kind.length + 1)));
    }
    const next = `${kind}-${String(highest + 1).padStart(3, "0")}`;
    if (kindOfIdentifier(next) !== kind) {
      throw new RangeError(`nextIdentifier: no identifier is left after ${kind}-${String(highest).padStart(3, "0")}: ${kind} takes exactly three digits`);
    }
    return next;
  }
  if (!SLUGGED.includes(kind)) {
    throw new TypeError(`nextIdentifier: ${JSON.stringify(kind) ?? String(kind)} is not a kind it gives an identifier of (${[...NUMBERED, ...SLUGGED].join(", ")})`);
  }
  if (slug === undefined || slug === null) throw new TypeError(`nextIdentifier: ${kind} is named by a slug, and none is given`);
  const id = typeof slug === "string" ? `${kind}-${slug}` : null;
  if (id === null || kindOfIdentifier(id) !== kind) {
    throw new TypeError(`nextIdentifier: ${JSON.stringify(slug)} is no slug — lowercase letters and digits in words joined by single hyphens`);
  }
  for (const used of everUsed) {
    if (used === id) {
      throw Object.assign(new Error(`nextIdentifier: ${id} was used before, and a withdrawn identifier is never given again`), { name: "IdentifierTaken" });
    }
  }
  return id;
}
