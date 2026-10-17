// An issue's mail list and the issue/browser decisions that leave identifiers out of a proposal.
// Module: MOD-mail-records

const identifierPattern = "MAIL-[0-9a-fA-F]{16}";
const wholeIdentifier = new RegExp(`^${identifierPattern}$`);
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
