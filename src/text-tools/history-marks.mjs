// The marks of history in a document — the places that record its history (MOD-text-tools, Interfaces: historyMarks and
// HistoryMark; `A DOCUMENT HOLDS NO HISTORY`).
//
// Module: MOD-text-tools
//
// Three kinds, in the forms the documents of the review layout have carried them:
//
//   withdrawal    a note that something was withdrawn: a line that begins with the label `Withdrawn:` — in emphasis such as
//                 `*Withdrawn:*`, or as a front matter key `withdrawn: <date>` —, a heading `Withdrawn`, or the word
//                 followed by a date, as a requirement's source carried it: `— withdrawn 2026-09-24`;
//   edit-stamp    a stamp of who edited what or when: a line that begins with `Last changed`, `Last edited`, `Last updated`,
//                 `Last modified` or `Last revised`, or with the label `Changed:`, `Edited:`, `Updated:`, `Modified:` or
//                 `Revised:` (also `… by:`), or a verb of change followed by a date: `reworded 2026-09-24`;
//   dated-change  a date given as the date of a change, `YYYY-MM-DD`: after a word of decision or acceptance, as in
//                 `PO decision <date>`, or set off by a comma as the date of an attribution, as in `(PO A. Maier, <date>)`
//                 or `PO, <date>: …`. Any other date is no mark: the date a fact was read, a version, a release, a
//                 measurement a document names, stated with the words that say what they are or in a table's cells.
//
// The word "withdrawn" or "changed" in a sentence that states a rule is no mark. A mark's line counts from 1 in the whole
// text, front matter included; its text is the mark as it stands, without the line ending — a label's or a heading's line
// from the label on, a dated note or stamp from its word to its date, a date alone. A date that is part of a withdrawal or an
// edit stamp is not marked again. The marks come in the order they stand.

const DATE = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])(?!\\d)";
// The beginning of a line that holds a label: blanks, perhaps a list item's marker or a quote's, then perhaps emphasis.
const LINE_START = "^[ \\t]*(?:[-*+>][ \\t]+)?";
const LABEL = `${LINE_START}[*_]{0,2}`;
// Between a word and its date: blanks, perhaps "on".
const ON = "(?:[ \\t]+on)?[ \\t]+";
// The words of an edit stamp's label, and the verbs of change that a date may follow.
const EDIT_WORDS = ["changed", "edited", "updated", "modified", "revised"];
const CHANGE_WORDS = [...EDIT_WORDS, "reworded", "rewritten", "amended", "corrected", "extended", "narrowed", "widened",
  "renamed", "added", "created"];
const EDITED = `(?:${EDIT_WORDS.join("|")})`;
// The words of a decision or an acceptance that a date given as the date of a change may follow directly.
const DECISION_WORDS = ["decision", "decided", "accepted", "acceptance"];
// An attribution set off by a comma: "PO", perhaps a name, then the comma its date follows — "PO A. Maier, <date>" or
// "PO, <date>".
const PO_ATTRIBUTION = "\\bPO(?:[ \\t]+[A-Z][\\w.]*)*,[ \\t]*";

// The rules, in their precedence: a place that two rules find is the first one's.
const RULES = [
  { kind: "withdrawal", re: new RegExp(`${LABEL}withdrawn[*_]{0,2}[ \\t]*:.*`, "i") },
  { kind: "withdrawal", re: /^[ \t]{0,3}#{1,6}[ \t]+withdrawn\b.*/i },
  { kind: "withdrawal", re: new RegExp(`\\bwithdrawn${ON}${DATE}`, "gi") },
  { kind: "edit-stamp", re: new RegExp(`${LABEL}(?:last[ _-]?${EDITED}(?=[ \\t]*(?::|by\\b|on\\b|at\\b|\\d|[*_]|$))`
    + `|${EDITED}(?:[ _-]by)?[*_]{0,2}[ \\t]*:).*`, "i") },
  { kind: "edit-stamp", re: new RegExp(`\\b(?:${CHANGE_WORDS.join("|")})${ON}${DATE}`, "gi") },
  { kind: "dated-change", re: new RegExp(`(?<=\\b(?:${DECISION_WORDS.join("|")})${ON})${DATE}`, "gi") },
  { kind: "dated-change", re: new RegExp(`(?<=${PO_ATTRIBUTION})${DATE}`, "g") },
];

// Every match of a rule in one line.
const matches = (re, line) => (re.global ? [...line.matchAll(re)] : [re.exec(line)].filter(Boolean));
// A mark's text: from its label or word on, without the line's indentation or list marker.
const markText = (match) => match.replace(new RegExp(LINE_START), "").trim();

// historyMarks(text: string) -> HistoryMark[] — the places of a document that record its history: a note that something was
// withdrawn, a stamp of who edited what or when, and a date given as the date of a change; a date that is part of what the
// document states is a mark too.
export function historyMarks(text) {
  const marks = [];
  String(text ?? "").split("\n").forEach((raw, index) => {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    const taken = [];
    for (const { kind, re } of RULES) {
      for (const m of matches(re, line)) {
        const start = m.index, end = m.index + m[0].length;
        if (taken.some((t) => start < t.end && t.start < end)) continue;
        taken.push({ start, end, kind, text: markText(m[0]) });
      }
    }
    taken.sort((a, b) => a.start - b.start);
    for (const t of taken) marks.push({ line: index + 1, kind: t.kind, text: t.text });
  });
  return marks;
}
