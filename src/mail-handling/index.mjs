// MOD-mail-handling: mail into issues, and closed issues into replies (docs/architecture/MOD-mail-handling.md).
// This entry offers the first half of the interface: reading new mail and carrying out a person's decision on a mail.
// Module: MOD-mail-handling

export { readNewMail, decideMail } from "./intake.mjs";
