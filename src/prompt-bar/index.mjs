// MOD-prompt-bar — the prompt bar, where a person talks to an agent about the page (docs/architecture/MOD-prompt-bar.md): its
// interface. Of it, ITM-503 builds the recording switch and the conversation record (record.mjs): recordingSchema and recordingOf.
// ITM-504 builds the bar (bar.mjs): startPromptBar, latestDraft and currentJob, with the participants it offers (offer.mjs) and a
// message sent as a job in this tab (send.mjs). A hand-over the participant proposes is shown without *Hand over*, which the item that
// follows builds.
//
// Module: MOD-prompt-bar
//
// It belongs to the Site (ARC-038) and runs in a browser. Every other file of this folder is private to the module.

export { currentJob, latestDraft, startPromptBar } from "./bar.mjs";
export { recordingOf, recordingSchema } from "./record.mjs";
