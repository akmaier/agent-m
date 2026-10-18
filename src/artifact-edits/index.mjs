// MOD-artifact-edits — saving edited and drafted files on the text they were opened on (docs/architecture/
// MOD-artifact-edits.md): its interface. Of it, ITM-206 builds reviewLayoutCommit, the review layout of a new product, ITM-219
// saveFile, one file a person edited, saved on the blob it was opened on, and ITM-335 saveFile's refusal of a changed
// identifier and fallbackEditLinks, GitHub's pages for an edit without a token, and ITM-395 saveFile's several edits with
// trailers, and keptIdentifier, and ITM-336 editStrategies' check identifier-kept and writer open-files, and ITM-722 saveGroupFile and saveFile's refusal of a group file with an item in more than one place.
//
// Module: MOD-artifact-edits

export { reviewLayoutCommit } from "./layout.mjs";
export { saveFile, keptIdentifier, saveGroupFile } from "./save.mjs";
export { fallbackEditLinks } from "./fallback.mjs";
export { editStrategies } from "./strategies.mjs";
