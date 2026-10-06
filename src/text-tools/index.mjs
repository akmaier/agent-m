// MOD-text-tools — the text primitives every format uses (docs/architecture/MOD-text-tools.md): its interface. Of it, ITM-212
// builds the front matter, the finding in its one text form, git's blob SHA, the line difference of two texts and the marks
// of history in a document; `sha256` is not built yet.
//
// Module: MOD-text-tools
//
// It belongs to the artifact model (ARC-048). It runs unchanged in a browser and in Node, keeps no state, performs no input or
// output and uses no other module. Every other file of this folder is private to it.

/**
 * The front matter of a text: the fields by key, the keys in the order they stand, the body, and the line on which the body
 * begins (from 1).
 * @typedef {{ fields: Record<string, string | string[]>, order: string[], body: string, bodyLine: number }} FrontMatter
 */

/**
 * One problem with a draft, in the one form `A FINDING READS LIKE A COMPILER MESSAGE` demands: the identifier of the artifact
 * it concerns — or, for a file without one, its path —, its line from 1, its kind, the requirement's name exactly as the SPEC
 * writes it, what is wrong, and the correction expected.
 * @typedef {{ artifact: string, line: number, kind: "error" | "warning", rule: string, what: string, fix: string }} Finding
 */

/**
 * One line of a difference, with its line in the text before and in the text after, where it has one.
 * @typedef {{ op: "same" | "added" | "removed", text: string, before: number | null, after: number | null }} DiffLine
 */

/**
 * One place in a document that records history (`A DOCUMENT HOLDS NO HISTORY`).
 * @typedef {{ line: number, kind: "withdrawal" | "edit-stamp" | "dated-change", text: string }} HistoryMark
 */

export { parseFrontMatter, formatFrontMatter } from "./front-matter.mjs";
export { finding, formatFinding, parseFinding } from "./findings.mjs";
export { blobSha } from "./hashes.mjs";
export { lineDiff } from "./line-diff.mjs";
export { historyMarks } from "./history-marks.mjs";
