// scheme.mjs — the pattern of each kind (MOD-identifiers' Data: docs/architecture/MOD-identifiers.md), the kind of a string by
// them, and the identifiers a text writes.
//
// Module: MOD-identifiers
//
// A slug is lowercase letters and digits in words joined by single hyphens.
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";

// A requirement: a name in capitals, digits, spaces, apostrophes, commas and hyphens, with no lowercase letter and no
// prefix of a kind below — a string such as UC-022 is that kind, never a requirement, even though digits, hyphens and
// capitals are all a requirement's name would otherwise allow.
const REQUIREMENT = /^(?!(?:SRC|UC|ARC|MOD|TST|ITM|RES|JOB)-)[A-Z0-9 ',-]*[A-Z][A-Z0-9 ',-]*$/;

// The scheme, in the order the module file's Data table lists it: requirement, then each prefixed kind. UC alone takes
// three or more digits; ARC, TST and ITM take exactly three, as the table's own examples do (ARC-048, TST-014, ITM-202).
// JOB's id is an eight-digit date, a four-digit time and four hexadecimal digits, each joined by a hyphen.
const SCHEME = [
  ["requirement", REQUIREMENT],
  ["SRC", new RegExp(`^SRC-${SLUG}$`)],
  ["UC", /^UC-\d{3,}$/],
  ["ARC", /^ARC-\d{3}$/],
  ["MOD", new RegExp(`^MOD-${SLUG}$`)],
  ["TST", /^TST-\d{3}$/],
  ["ITM", /^ITM-\d{3}$/],
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
