// The findings of a requirement (docs/architecture/MOD-spec-document.md, Interfaces: requirementFindings). ITM-301 builds it,
// ITM-379 adds the finding for a name that is no requirement's name; index.mjs offers it as requirementFindings. With it, requirementForm (Interfaces:
// requirementForm): the form those findings judge a requirement by, cut from Agent M's SPEC.md, the names they cite kept once here.
//
// Module: MOD-spec-document
//
// Pure: it reads only the Spec it is given, keeps nothing, performs no input or output, and never throws on content. Each
// finding is made with MOD-text-tools' finding, names the requirement — its name is its identifier — and the line of its head
// line, and says in one line what is wrong and what correction is expected. Where the module file leaves a reading open, this
// file states the reading it takes:
//
//   - A requirement missing a source, a rule and a check has three findings, one for each field. A missing check is reported
//     under A REQUIREMENT HAS FOUR FIELDS only: it cannot also name neither a test nor review.
//   - A check names a test when `checkPaths` is not empty — the paths parseSpec reads at its start —, or when a path below
//     `tests/` stands anywhere in it, on its first line or on a later one. It names review when it says "at review", the words
//     of `no automatic check; at review`.
//   - A rule contains "and" or "additionally" as a word of its own, in any case, over line breaks. What stands in a code span
//     is a name that refers to another requirement, and is no word of the rule's statement.
//   - A name given twice is found in the sections' lists of names, the one place a Spec holds every requirement that was read:
//     `requirements` holds one for each name, the last read, which for two is the second. That one is reported, once.
//   - A name is a requirement's name when MOD-identifiers' kindOfIdentifier reads it as one; any other is reported under EVERY
//     ARTIFACT HAS AN IDENTIFIER, so that the scheme stays that module's. That is a name not in capitals, which parseSpec reads
//     as a requirement too, and a name in capitals that uses a character outside the scheme.
//   - A mark of history is looked for in the three texts of a requirement, its source, rule and check, and reported at the
//     requirement's line; `what` quotes the mark and says where it stands.

import { kindOfIdentifier } from "../identifiers/index.mjs";
import { finding, historyMarks } from "../text-tools/index.mjs";
import { parseSpec } from "./parse.mjs";

const FOUR_FIELDS = "A REQUIREMENT HAS FOUR FIELDS";
const NAMES_ITS_CHECK = "A REQUIREMENT NAMES ITS CHECK";
const ONE_STATEMENT = "ONE STATEMENT PER REQUIREMENT";
const NAME_SURVIVES = "THE NAME IS THE ID AND IT SURVIVES";
const HAS_IDENTIFIER = "EVERY ARTIFACT HAS AN IDENTIFIER";
const NO_HISTORY = "A DOCUMENT HOLDS NO HISTORY";

const AT_REVIEW = /\bat review\b/i;
const NAMES_A_TEST = /\btests\/[\w./-]+/;
const CONJUNCTION = /\b(and|additionally)\b/i;
const CODE_SPAN = /`[^`]*`/g;

// requirementFindings(spec: Spec) -> Finding[] — for each requirement of a Spec, as parseSpec read it, in the order the
// requirements stand: an error under A REQUIREMENT HAS FOUR FIELDS when its source, rule or check is missing; an error under
// A REQUIREMENT NAMES ITS CHECK when its check names neither a test nor review; a warning under ONE STATEMENT PER REQUIREMENT
// when its rule contains "and" or "additionally", which a person then splits or keeps with a reason; an error under THE NAME
// IS THE ID AND IT SURVIVES for a name given twice; an error under EVERY ARTIFACT HAS AN IDENTIFIER for a name that MOD-identifiers'
// scheme does not read as a requirement's name, such as a name not in capitals; and an error under A DOCUMENT HOLDS NO HISTORY for
// each mark of history. Each finding names the requirement and its line.
export function requirementFindings(spec) {
  const standing = new Map();
  for (const section of spec.sections) {
    for (const name of section.requirements) standing.set(name, (standing.get(name) ?? 0) + 1);
  }

  const found = [];
  for (const r of spec.requirements.values()) {
    const add = (kind, rule, what, fix) => found.push(finding({ artifact: r.name, line: r.line, kind, rule, what, fix }));

    if (r.source === null) {
      add("error", FOUR_FIELDS, "no source", "name the source after the name, in italics in parentheses: **NAME** *(source)*");
    }
    if (r.rule === null) {
      add("error", FOUR_FIELDS, "no rule", "state the rule, one statement, on the line after the source");
    }
    if (r.check === null) {
      add("error", FOUR_FIELDS, "no check",
        "add a line *Check:* that names the test guarding the rule, or says: no automatic check; at review");
    } else if (r.checkPaths.length === 0 && !NAMES_A_TEST.test(r.check) && !AT_REVIEW.test(r.check)) {
      add("error", NAMES_ITS_CHECK, "the check names neither a test nor review",
        "begin the check with the path of the test that guards the rule, in backticks, or write: no automatic check; at review");
    }

    const conjunction = r.rule === null ? null : CONJUNCTION.exec(r.rule.replace(CODE_SPAN, ""));
    if (conjunction) {
      add("warning", ONE_STATEMENT, `the rule contains "${conjunction[1]}"`,
        "split it into two requirements, or keep it and give a one-line reason");
    }

    if (standing.get(r.name) > 1) {
      add("error", NAME_SURVIVES, "the name is given to more than one requirement",
        "keep the name for one requirement only: rename the other, or remove it");
    }

    if (kindOfIdentifier(r.name) !== "requirement") {
      add("error", HAS_IDENTIFIER, "the name is not a requirement's name by the scheme of identifiers",
        "write the name in capitals, as EVERY ARTIFACT HAS AN IDENTIFIER gives it: words of capital letters, digits, apostrophes, commas, hyphens and dots, separated by single spaces");
    }

    for (const [part, text] of [["source", r.source], ["rule", r.rule], ["check", r.check]]) {
      for (const mark of text === null ? [] : historyMarks(text)) {
        add("error", NO_HISTORY, `the ${part} holds a mark of history (${mark.kind}): "${mark.text}"`,
          "remove it; the version history keeps what was changed, when and by whom");
      }
    }
  }
  return found;
}

// ---------------------------------------------------------------- the form a requirement is judged by

// The requirements requirementFindings cites, in the order its findings list them: the names above, kept once here.
const CITED = [FOUR_FIELDS, NAMES_ITS_CHECK, ONE_STATEMENT, NAME_SURVIVES, HAS_IDENTIFIER, NO_HISTORY];
const FORM_PARAGRAPH = "**Form of a requirement:**";
const PARAGRAPH_NAMED = "the paragraph *Form of a requirement*";

// requirementForm(specText: string) -> string — what requirementFindings judges a requirement by, cut from the text of Agent M's
// own SPEC.md, for a drafter to read (A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY): the paragraph that begins
// `**Form of a requirement:**`, from its first line to the line before the next empty line, then the block of each cited
// requirement, from its head line to the end of its check — the line before an empty line, a heading or another requirement's
// head line, as parseSpec ends a requirement —, in the order above, each byte for byte without its last line end, separated by one
// empty line. Throws FormMissing { missing }, naming the paragraph and each requirement the text does not hold, in that order, so
// that no drafter receives part of the form. Pure.
export function requirementForm(specText) {
  const text = String(specText ?? "");
  const starts = [0];
  for (let at = text.indexOf("\n"); at >= 0; at = text.indexOf("\n", at + 1)) starts.push(at + 1);
  const lineAt = (i) => text.slice(starts[i], i + 1 < starts.length ? starts[i + 1] - 1 : text.length).replace(/\r$/, "");
  const parsed = parseSpec(text);
  const heads = new Set([...parsed.requirements.values()].map((r) => r.line - 1));
  // The block from line `first` to the line before the first that ends it, without its last line end.
  const blockFrom = (first, ends) => {
    let last = first;
    while (last + 1 < starts.length && !ends(last + 1)) last++;
    return text.slice(starts[first], starts[last] + lineAt(last).length);
  };
  const blank = (i) => lineAt(i).trim() === "";

  const pieces = [], missing = [];
  const paragraph = [...starts.keys()].find((i) => lineAt(i).startsWith(FORM_PARAGRAPH));
  if (paragraph === undefined) missing.push(PARAGRAPH_NAMED);
  else pieces.push(blockFrom(paragraph, blank));
  for (const name of CITED) {
    const held = parsed.requirements.get(name);
    if (!held) missing.push(name);
    else pieces.push(blockFrom(held.line - 1, (i) => blank(i) || /^#{1,6}(?:[ \t]|$)/.test(lineAt(i)) || heads.has(i)));
  }
  if (missing.length) {
    throw Object.assign(new Error(`the SPEC.md holds not all of the form of a requirement: it lacks ${missing.join(", ")}`), { name: "FormMissing", missing });
  }
  return pieces.join("\n\n");
}
