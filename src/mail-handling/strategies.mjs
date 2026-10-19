// The strategies MOD-mail-handling offers to MOD-job-runner: the recipes `mail-batch` and `reply-inputs`, and the writer
// `mail-drafts`. A recipe reads its input from the job's parameters, which the page that starts the job fills.
// Module: MOD-mail-handling

import { storeReplies } from "./replies.mjs";

const part = (name, text) => ({ name, text, size: 0, sources: [], required: true });

/**
 * The recipe `mail-batch`, for proposing issues. Parameters: `mails`, `{ mail: Mail, people: People, ticked: string[] }[]` — the
 * chosen mails, each with its people and the names of the attachments the person ticked for it —, and `products`, `{ address:
 * string, host: Host }[]`. One part per mail with its identifier, subject, date and text, and the text of its ticked
 * attachments, numbered rather than named (a name can name a person); one part with the products and their descriptions; one part
 * with the titles and numbers of their open issues. The mail's headers go into no part: the people of all the chosen mails go
 * into the job's parameters as one `People` (`params.people`), where the check `people-search` of MOD-personal-data reads them.
 */
async function mailBatch(context, params) {
  const mails = params.mails ?? [];
  const products = params.products ?? [];

  const people = { names: [], addresses: [], phones: [], accounts: [] };
  for (const each of mails) for (const key of Object.keys(people)) people[key].push(...(each.people[key] ?? []).filter((value) => !people[key].includes(value)));
  context.params.people = people;
  const parts = mails.map(({ mail, ticked = [] }) => {
    const attached = mail.attachments.filter((each) => ticked.includes(each.name) && each.text !== null);
    const lines = [`Mail ${mail.id}`, `Subject: ${mail.subject}`, `Date: ${mail.date}`, "", mail.text];
    attached.forEach((each, index) => lines.push("", `Attachment ${index + 1} of ${mail.id}:`, each.text));
    return part(`mail ${mail.id}`, lines.join("\n"));
  });

  const described = [];
  const open = [];
  for (const { address, host } of products) {
    described.push(`${address}: ${(await host.repositoryInfo()).description}`);
    const titles = (await host.listIssues({ state: "open" })).map((each) => `#${each.number} ${each.title}`);
    open.push(`${address}:`, ...(titles.length ? titles : ["(no open issues)"]));
  }
  return [...parts, part("products", described.join("\n")), part("open issues", open.join("\n"))];
}

/**
 * The recipe `reply-inputs`, for drafting replies. Parameters: `due`, one `Due` of `repliesDue`, and `host`, the host of its
 * product. One part with the issue, the closing pull request or commit, and the release — said not to be known where it is
 * `null`, never found out here —; one part per listed mail that has no reply and is found in the mailbox, with its identifier,
 * subject, date and text, and not its headers.
 */
async function replyInputs(context, params) {
  const { due, host } = params;
  const issue = (await host.listIssues({ state: "all" })).find((each) => each.number === due.issue);
  const lines = [`Issue #${due.issue}${issue ? `: ${issue.title}` : ""}`];
  if (issue) lines.push("", issue.body);
  lines.push("", `Solved by: ${due.closedBy ?? "not known"}`, `Release: ${due.release ?? "not known"}`);
  const mails = due.mails.filter((each) => each.mail && !each.noted).map(({ id, mail }) =>
    part(`mail ${id}`, [`Mail ${id}`, `Subject: ${mail.subject}`, `Date: ${mail.date}`, "", mail.text].join("\n")));
  return [part("issue", lines.join("\n")), ...mails];
}

/**
 * The writer `mail-drafts`. Parameters: `due`, as for `reply-inputs`, and `mailbox`. Stores each drafted text, `result.draft.replies`
 * as `{ mail: string, text: string }[]`, through `storeReplies`; it sends nothing. A text for a mail the issue does not list, or that
 * has a reply, is stored for no one and named in `notes`, as is a mail that cannot be answered. `shown` is what `storeReplies` gave.
 */
async function mailDrafts(result, context) {
  const { due, mailbox } = context.params;
  const open = new Map(due.mails.filter((each) => each.mail && !each.noted).map(({ id, mail }) => [id, mail]));
  const notes = [];
  const replies = [];
  for (const { mail: id, text } of result.draft.replies) {
    if (open.has(id)) replies.push({ mail: open.get(id), body: text });
    else notes.push(`No draft for ${id}: the issue lists no mail of it without a reply.`);
  }
  const shown = await storeReplies(mailbox, replies);
  for (const { id, problem } of shown) if (problem) notes.push(`No draft for ${id}: ${problem}.`);
  return { commits: [], files: [], pullRequest: null, shown, notes };
}

/** mailStrategies — of MOD-job-runner's `Strategies`: the recipes `mail-batch` and `reply-inputs`, the writer `mail-drafts`. */
export const mailStrategies = {
  recipes: { "mail-batch": mailBatch, "reply-inputs": replyInputs },
  writers: { "mail-drafts": mailDrafts },
};
