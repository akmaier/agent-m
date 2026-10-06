// MOD-artifact-edits — saving edited and drafted files on the text they were opened on (docs/architecture/
// MOD-artifact-edits.md): its interface. Of it, ITM-206 builds reviewLayoutCommit, the review layout of a new product, and
// ITM-219 saveFile, one file a person edited, saved on the blob it was opened on.
//
// Module: MOD-artifact-edits

export { reviewLayoutCommit } from "./layout.mjs";
export { saveFile } from "./save.mjs";
