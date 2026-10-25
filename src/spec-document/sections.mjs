// A SPEC section's exact bytes, its replacement, and the names it holds (docs/architecture/MOD-spec-document.md, Interfaces:
// sectionText, replaceSection, requirementNamesIn and renamedRequirements). ITM-302 builds them; index.mjs offers them.
//
// Module: MOD-spec-document
//
// Pure: it reads only the texts it is given, keeps nothing and performs no input or output. What a section is, is parseSpec's: it
// begins with a heading of level two outside a fenced block and ends before the next one or at the end of the text, and its `start`
// and `end` are its byte range. A section's bytes are the slice of the text between them — not its lines normalised, trimmed or
// ended —, since a caller compares or hashes them and the approved text is taken verbatim. Where the module file leaves a reading
// open, this file states the reading it takes:
//
//   - A heading is a section's heading line as parseSpec reads it, line end left out, compared whole: no prefix, no trimming. Where
//     two sections have the same heading line, the first is the one.
//   - A heading that the SPEC lacks is added as a new section when the text given begins with a section that the SPEC holds: the
//     text "with the preceding section" names the place by its first heading line. That section is replaced by the whole text,
//     which holds it and the new section after it. Without such a heading in the text, there is no place, and SectionNotFound is
//     thrown.
//   - The names a text holds are the keys of the requirements parseSpec reads in it, in the order they stand; a name given twice
//     is named once, at its first place.
//   - A rename or any other change of a name is a name withdrawn and a name added; a requirement under the same name is neither,
//     whatever else of it changed. Withdrawn names stand in the order of the first version, added names in the order of the second.

import { parseSpec } from "./parse.mjs";

// The section of `text` whose heading line is `heading`, as parseSpec reads it — with its byte range —, or undefined.
const sectionOf = (text, heading) => parseSpec(text).sections.find((section) => section.heading === heading);

// sectionText(specText: string, heading: string) -> string | null — the exact bytes of the section whose heading line is `heading`:
// from the start of that line to the byte before the next heading of level two, or to the end of the text. null where the text has
// no such section.
export function sectionText(specText, heading) {
  const section = sectionOf(specText, heading);
  return section ? specText.slice(section.start, section.end) : null;
}

// replaceSection(specText: string, heading: string, replacement: string) -> string — the SPEC with the bytes of the section whose
// heading line is `heading` replaced by `replacement`, byte for byte, every other byte unchanged; nothing is added to the
// replacement or taken from it. A heading that the SPEC lacks is added as a new section after the preceding section that
// `replacement` begins with: that section's bytes are replaced by `replacement`. Throws SectionNotFound, naming the heading, where
// neither the heading nor the first heading of `replacement` is a section of the SPEC.
export function replaceSection(specText, heading, replacement) {
  const section = sectionOf(specText, heading) ?? sectionOf(specText, parseSpec(replacement).sections[0]?.heading);
  if (!section) {
    throw Object.assign(new Error(`the SPEC has no section with the heading line ${JSON.stringify(heading)}, and the text given does `
      + "not begin with a section that it has, after which to add one"), { name: "SectionNotFound" });
  }
  return specText.slice(0, section.start) + replacement + specText.slice(section.end);
}

// requirementNamesIn(text: string) -> string[] — the names of the requirements a text holds as head lines, in order.
export function requirementNamesIn(text) {
  return [...parseSpec(text).requirements.keys()];
}

// renamedRequirements(before: string, after: string) -> { withdrawn: string[], added: string[] } — for two versions of a section,
// the names that the second no longer holds and the names it holds new.
export function renamedRequirements(before, after) {
  const was = requirementNamesIn(before), is = requirementNamesIn(after);
  return { withdrawn: was.filter((name) => !is.includes(name)), added: is.filter((name) => !was.includes(name)) };
}
