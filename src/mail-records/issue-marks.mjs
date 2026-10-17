// An issue's mail list, handling-note text and the decisions that leave identifiers out of a proposal.
// Module: MOD-mail-records

const identifierPattern = "MAIL-[0-9a-fA-F]{16}";
const wholeIdentifier = new RegExp(`^${identifierPattern}$`);
const wholeItemIdentifier = /^ITM-\d{3}$/;
const listedIdentifier = new RegExp("`(" + identifierPattern + ")`", "g");
const addedMail = new RegExp("^Mail `(" + identifierPattern + ")` added on \\d{4}-\\d{2}-\\d{2}\\.$");

/**
 * @param {string} text
 * @param {string[]} ids
 * @returns {string}
 */
export function withMailIds(text, ids) {
  if (ids.some((id) => wholeIdentifier.exec(id)?.[0] !== id)) {
    throw Object.assign(new Error("Use MAIL- followed by sixteen hexadecimal digits."), { name: "NotAnIdentifier" });
  }
  return `${text}\n\nMails: ${ids.map((id) => `\`${id}\``).join(", ")}`;
}

/**
 * @param {"mail-added" | "reply-sent" | "question-sent" | "no-reply" | "item-added" | "closed-with"} kind
 * @param {string} subject
 * @param {string} date
 * @param {string} [link]
 * @returns {string}
 */
export function noteText(kind, subject, date, link) {
  const identifier = kind === "item-added" || kind === "closed-with" ? wholeItemIdentifier : wholeIdentifier;
  if (identifier.exec(subject)?.[0] !== subject) {
    throw Object.assign(new Error("Use a mail or item identifier for this note."), { name: "NotAnIdentifier" });
  }
  switch (kind) {
    case "mail-added": return `Mail \`${subject}\` added on ${date}.`;
    case "reply-sent": return `Reply sent to \`${subject}\` on ${date}.`;
    case "question-sent": return `Question sent to \`${subject}\` on ${date}.`;
    case "no-reply": return `No reply to \`${subject}\`, decided on ${date}.`;
    case "item-added": return `Backlog item \`${subject}\` added: ${link}`;
    case "closed-with": return `Closed with ${link}; item \`${subject}\`.`;
  }
}

/**
 * @param {{number: number, body: string, comments: {body: string, createdAt: string}[]}} issue
 * @returns {string[]}
 */
export function listedMailIds(issue) {
  const ids = new Set();
  const line = issue.body.match(/^Mails: (.+)$/m)?.[1] ?? "";
  for (const match of line.matchAll(listedIdentifier)) ids.add(match[1]);
  for (const comment of issue.comments) {
    const match = addedMail.exec(comment.body);
    if (match) ids.add(match[1]);
  }
  return [...ids];
}

/**
 * @param {string[]} ids
 * @param {Set<string>} listed
 * @param {Set<string>} marked
 * @returns {string[]}
 */
export function undecided(ids, listed, marked) {
  return ids.filter((id) => !listed.has(id) && !marked.has(id));
}
