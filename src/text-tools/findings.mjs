// The finding — one problem with a draft, in the one form `A FINDING READS LIKE A COMPILER MESSAGE` demands (MOD-text-tools,
// Data: The finding): as data, and as one line of text,
//
//   <artifact>:<line>: <kind>: <what> [<rule>] — <fix>.
//
// Module: MOD-text-tools
//
// The form is the one the findings of docs/assets/artifacts/checks.mjs and headers.mjs are written in, with the period that
// the module file's example puts after the correction.

// A requirement's name in capitals, as the SPEC writes it: capital letters, digits, spaces, apostrophes, commas and hyphens,
// at least one capital letter, no blank, comma or hyphen at either end, and none of the identifiers' prefixes — the scheme
// MOD-identifiers owns, which this module cannot use, since MOD-identifiers uses it.
const NAME = "(?!(?:SRC|UC|ARC|MOD|TST|ITM|RES|JOB)-)(?=[A-Z0-9 ',-]*[A-Z])[A-Z0-9](?:[A-Z0-9 ',-]*[A-Z0-9'])?";
const REQUIREMENT_NAME = new RegExp(`^${NAME}$`);
const FINDING_LINE = new RegExp(`^(.+?):([1-9]\\d*): (error|warning): (.*?) \\[(${NAME})\\] — (.*)\\.$`);

const shown = (value) => (typeof value === "string" ? JSON.stringify(value) : String(value));

// finding(fields: Finding) -> Finding — a finding, checked. Throws TypeError when `kind` is neither `error` nor `warning`, when
// `line` is not a whole number of at least 1, or when `rule` is not a requirement's name in capitals. Every module that
// reports a finding makes it with this function.
export function finding(fields) {
  const { artifact, line, kind, rule, what, fix } = fields ?? {};
  if (kind !== "error" && kind !== "warning") {
    throw new TypeError(`finding: the kind is "error" or "warning", not ${shown(kind)}`);
  }
  if (!Number.isInteger(line) || line < 1) {
    throw new TypeError(`finding: the line is a whole number of at least 1, not ${shown(line)}`);
  }
  if (typeof rule !== "string" || !REQUIREMENT_NAME.test(rule)) {
    throw new TypeError(`finding: the rule is a requirement's name in capitals, not ${shown(rule)}`);
  }
  return { artifact, line, kind, rule, what, fix };
}

// formatFinding(finding: Finding) -> string — the finding as its one line of text:
// `<artifact>:<line>: <kind>: <what> [<rule>] — <fix>.`
export function formatFinding(f) {
  return `${f.artifact}:${f.line}: ${f.kind}: ${f.what} [${f.rule}] — ${f.fix}.`;
}

// parseFinding(line: string) -> Finding | null — a line of the finding's text form read back; null for any other line. A line
// ending at its end is not part of the line.
export function parseFinding(line) {
  if (typeof line !== "string") return null;
  const m = FINDING_LINE.exec(line.replace(/\r?\n$/, ""));
  if (!m) return null;
  const [, artifact, number, kind, what, rule, fix] = m;
  return { artifact, line: Number(number), kind, rule, what, fix };
}
