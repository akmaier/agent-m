// MOD-mail-handling: mail into issues, and closed issues into replies (docs/architecture/MOD-mail-handling.md).
// This entry offers reading new mail and a person's decision on a mail (intake.mjs), and the replies due, storing, sending and
// noting replies and asking a reporter (replies.mjs), and the recipes and writer of the mail kinds (strategies.mjs).
// Module: MOD-mail-handling

export { readNewMail, decideMail } from "./intake.mjs";
export { repliesDue, storeReplies, sendReply, askReporter, noReply } from "./replies.mjs";
export { mailStrategies } from "./strategies.mjs";
