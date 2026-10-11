// propose.mjs — the sections a draft of requirements changes (MOD-spec-changes, Parts: propose.mjs; Interfaces: entrySections). Of it,
// ITM-393 builds entrySections; proposeSection, openQueueOf and the writer of classified candidates are not built yet.
//
// Module: MOD-spec-changes
//
// Pure: it reads only the texts it is given, and performs no input or output. A section's bytes are MOD-spec-document's: the slice of
// the SPEC from its heading line to the next heading of level two. A draft is `{ candidates }` as the kinds derive-requirements and
// change-requirements return it, and `classes` are MOD-documents' Classified, one for the candidates merged into it, whose first ref is
// the name of the candidate whose rule and check it takes. Where the module file leaves a reading open, this file states the one it takes:
//
//   - A `new` requirement is added at the end of the section of the requirement its class's `of` names when the SPEC holds it, else of the
//     last section; with no section in the SPEC there is no place, and it is a RangeError.
//   - A `change` replaces the requirement's block by its name as it stands, the sources it states with the job's added, and the
//     candidate's rule and check, each on one line; a `duplicate` adds the job's sources to the head line and touches no other byte. A
//     `change` or a `duplicate` of a requirement the SPEC does not hold is RequirementNotFound { requirements }, naming every such name
//     in the order of the classes. The sources of the rule a candidate points to are those the requirement states: they are kept.
//   - The job's source is one item for each passage of the class, `<source>, <passage>`, or the source alone for none; an item the
//     requirement names already is not added again.
//   - A candidate without a class, and a `conflict`, are not composed: a conflict is composed as the person resolved it, that is, as the
//     class they gave it. A section whose text the draft leaves as it is is not returned; the sections come in the order of the SPEC.
//   - The line end of a section is that of its first line.

import { parseSpec, sectionText } from "../spec-document/index.mjs";

const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });
const folded = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const HEADING = /^#{1,6}\s/;
const SOURCE_START = "*(";
const SOURCE_END = ")*";

// The lines of a text, each with its line end.
const linesOf = (text) => text.split(/(?<=\n)/);
const isBlank = (line) => line.trim() === "";

// The requirement `name` of a section's text: the places of its first and last line in `lines`, and the requirement.
function located(sectionText_, lines, name) {
  const spec = parseSpec(sectionText_);
  const requirement = spec.requirements.get(name);
  const others = new Set([...spec.requirements.values()].map((each) => each.line - 1));
  const first = requirement.line - 1;
  let end = first + 1;
  while (end < lines.length && !isBlank(lines[end]) && !HEADING.test(lines[end]) && !others.has(end)) end++;
  return { first, end, requirement };
}

// A head line block with the items added to its source: raw source text kept, items after it; a block without a source gets one
// after its name.
function withSources(block, name, items) {
  if (items.length === 0) return block;
  const head = `**${name}**`;
  const at = block.indexOf(SOURCE_START, head.length);
  const end = at < 0 ? -1 : block.indexOf(SOURCE_END, at);
  if (end < 0) return `${head} ${SOURCE_START}${items.join("; ")}${SOURCE_END}${block.slice(head.length)}`;
  return `${block.slice(0, end).trimEnd()}; ${items.join("; ")}${block.slice(end)}`;
}

/**
 * entrySections(spec, draft, classes, source) -> Array<{ anchor, until, text }> — the sections of `spec` that the draft's candidates
 * change, each as the whole section's new text, composed by `classes`. Every other byte of a section stays as it is. Pure.
 * @param {string} spec
 * @param {unknown} draft
 * @param {Array<{ refs: string[], from: string[], class: string, of: string | null }>} classes
 * @param {string} source the job's source
 */
export function entrySections(spec, draft, classes, source) {
  if (typeof source !== "string" || source.trim() === "") throw new TypeError("entrySections needs the job's source as text");
  const text = String(spec ?? "");
  const parsed = parseSpec(text);
  const drafted = Array.isArray(draft?.candidates) ? draft.candidates : [];
  const composed = (Array.isArray(classes) ? classes : []).map((each) => ({ each, candidate: drafted.find((item) => item?.name === each.refs?.[0]) }))
    .filter(({ each, candidate }) => candidate && each.class !== "conflict" && ["new", "change", "duplicate"].includes(each.class));

  const missing = composed.filter(({ each }) => each.class !== "new" && !parsed.requirements.has(each.of)).map(({ each }) => each.of);
  if (missing.length > 0) {
    const names = [...new Set(missing)];
    throw failure("RequirementNotFound", `the SPEC holds no requirement ${names.join(", ")}`, { requirements: names });
  }

  const texts = new Map();
  const current = (heading) => (texts.has(heading) ? texts.get(heading) : sectionText(text, heading));
  for (const { each, candidate } of composed) {
    const held = parsed.requirements.get(each.of);
    const heading = each.class === "new"
      ? (held?.section ?? parsed.sections.at(-1)?.heading)
      : held.section;
    if (heading === undefined || heading === null) throw new RangeError("the SPEC has no section to add a requirement to");
    const section = current(heading);
    const eol = /\r\n/.test(section.split(/(?<=\n)/)[0] ?? "") ? "\r\n" : "\n";
    const items = (each.from.length > 0 ? each.from : [null]).map((passage) => (passage === null ? source : `${source}, ${passage}`));
    if (each.class === "new") {
      const block = `**${folded(candidate.name)}** ${SOURCE_START}${[...new Set(items)].join("; ")}${SOURCE_END}${eol}${folded(candidate.rule)}${eol}*Check:* ${folded(candidate.check)}`;
      const next = section.endsWith(`${eol}${eol}`) ? `${section}${block}${eol}${eol}`
        : section.endsWith("\n") ? `${section}${eol}${block}${eol}` : `${section}${eol}${eol}${block}`;
      texts.set(heading, next);
      continue;
    }
    const lines = linesOf(section);
    const { first, end, requirement } = located(section, lines, each.of);
    const added = [...new Set(items)].filter((item) => !requirement.sources.includes(item));
    const old = lines.slice(first, end).join("");
    const last = old.match(/(\r?\n)?$/)[0];
    const body = old.slice(0, old.length - last.length);
    const block = each.class === "duplicate" ? withSources(body, requirement.name, added)
      : withSources(`**${requirement.name}**${requirement.source === null ? "" : ` ${SOURCE_START}${requirement.source}${SOURCE_END}`}${eol}${folded(candidate.rule)}${eol}*Check:* ${folded(candidate.check)}`, requirement.name, added);
    texts.set(heading, [...lines.slice(0, first), `${block}${last}`, ...lines.slice(end)].join(""));
  }
  return parsed.sections.filter((section) => texts.has(section.heading) && texts.get(section.heading) !== sectionText(text, section.heading))
    .map((section) => ({ anchor: section.heading, until: null, text: texts.get(section.heading) }));
}
