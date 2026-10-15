// MOD-prompt-bar — the prompt bar, where a person talks to an agent about the page (docs/architecture/MOD-prompt-bar.md): its
// interface. Of it, ITM-503 builds the recording switch and the conversation record (record.mjs): recordingSchema and recordingOf.
// The bar itself (startPromptBar, latestDraft, currentJob) is ITM-504 and the items that follow.
//
// Module: MOD-prompt-bar
//
// It belongs to the Site (ARC-038) and runs in a browser. Every other file of this folder is private to the module.

export { recordingOf, recordingSchema } from "./record.mjs";
