// scheme.mjs — the pattern of each kind (MOD-identifiers' Data: docs/architecture/MOD-identifiers.md).
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
