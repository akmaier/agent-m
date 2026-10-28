// MOD-prompt-bar — the prompt bar, where a person talks to an agent about the page (docs/architecture/MOD-prompt-bar.md): its
// interface. Of it, ITM-503 builds the recording switch and the conversation record (record.mjs): recordingSchema and recordingOf.
// ITM-504 builds the bar (bar.mjs): startPromptBar, latestDraft and currentJob, with the participants it offers (offer.mjs) and a
// message sent as a job in this tab (send.mjs). ITM-505 builds the hand-over a participant proposes in the bar: its route
// (hand-over.mjs), queued as the participant's own job (UC-049 4a.2) and followed until it has ended, with *Stop* cancelling it (follow.mjs).
// ITM-572 adds handOverStrategies (hand-over.mjs), the strategy sets a hand-over is prepared with, which the frame registers.
//
// Module: MOD-prompt-bar
//
// It belongs to the Site (ARC-038) and runs in a browser. Every other file of this folder is private to the module.

export { currentJob, dropDraft, latestDraft, startPromptBar } from "./bar.mjs";
export { handOverStrategies } from "./hand-over.mjs";
export { recordingOf, recordingSchema } from "./record.mjs";
export { endpointLacks, endpointsOffered } from "./offer.mjs";
export { spawnEndpointJob } from "./hand-over.mjs";
export { followJob } from "./follow.mjs";
