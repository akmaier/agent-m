// The replies due from closed issues and answers received, storing, sending and noting replies, asking a reporter.
// Module: MOD-mail-handling

import { issueLabels, listedMailIds, mailId, noteText, notesOf } from "../mail-records/index.mjs";

const today = () => new Date().toISOString().slice(0, 10);
const NOT_SENDABLE = "not sendable";
const ADDRESS = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const CLOSED_WITH = /^Closed with (\S.*?)(?:; item `ITM-\d{3,}`)?\.$/;

/** A host's `Issue` as MOD-mail-records reads an issue: a comment's `date` is its `createdAt`. */
const issueText = (issue) => ({
  number: issue.number,
  body: issue.body,
  comments: issue.comments.map((comment) => ({ body: comment.body, createdAt: comment.date })),
});

/** The identifier of a message named by its Message-ID, or null for no Message-ID. */
const idOf = (messageId) => (messageId ? mailId({ messageId, bytes: null }) : null);

/**
 * repliesDue(mailbox, products) -> Promise<RepliesDue> — every issue that lists mails, grouped: closed with a listed mail that
 * has no reply or no-reply note (`toAnswer`); open, labelled waiting-for-reporter, with a mail added after the last question
 * (`answerReceived`); open (`open`). Each listed mail is found in the mailbox, with its draft in Drafts. A reply found in Sent
 * that no issue notes yet is noted in its issue now. Errors pass unchanged.
 */
export async function repliesDue(mailbox, products) {
  const issues = [];
  for (const { address, host } of products) {
    for (const issue of await host.listIssues({ state: "all" })) {
      const text = issueText(issue);
      const ids = listedMailIds(text);
      if (ids.length) issues.push({ address, host, issue, text, ids, notes: notesOf(text) });
    }
  }

  const draftsOf = new Map();
  for (const draft of await mailbox.drafts()) {
    const id = await idOf(draft.inReplyTo);
    if (id && !draftsOf.has(id)) draftsOf.set(id, draft.ref);
  }

  await noteSentReplies(await mailbox.sent(null), issues);

  const result = { toAnswer: [], answerReceived: [], open: [] };
  for (const entry of issues) {
    const answered = (id) => entry.notes.some((note) => (note.kind === "reply-sent" || note.kind === "no-reply") && note.subject === id);
    const closed = entry.issue.state === "closed";
    let group;
    if (closed) group = entry.ids.some((id) => !answered(id)) ? result.toAnswer : null;
    else group = answerReceived(entry) ? result.answerReceived : result.open;
    if (!group) continue;
    const mails = [];
    for (const id of entry.ids) mails.push({ id, mail: await mailbox.find(id), draft: draftsOf.get(id) ?? null, noted: answered(id) });
    group.push({ product: entry.address, issue: entry.issue.number, closedBy: closedBy(entry), release: null, mails });
  }
  return result;
}

/** Labelled waiting-for-reporter, and a mail added after the last question sent. */
function answerReceived({ issue, notes }) {
  if (!issue.labels.includes(issueLabels.waitingForReporter)) return false;
  const lastQuestion = notes.findLastIndex((note) => note.kind === "question-sent");
  return notes.some((note, index) => note.kind === "mail-added" && index > lastQuestion);
}

/** The address a `closed-with` note names, or null where no note says how the issue was closed. */
function closedBy({ issue }) {
  for (const { body } of [...issue.comments].reverse()) {
    const match = CLOSED_WITH.exec(body);
    if (match) return match[1];
  }
  return null;
}

/**
 * A mail in Sent that answers a listed mail with no reply note is noted now, with the date it was sent. A listed mail that a
 * question was sent to is left: the sent mail may be that question.
 */
async function noteSentReplies(sent, issues) {
  for (const reply of sent) {
    const candidates = [reply.inReplyTo, ...reply.references].filter(Boolean);
    for (const messageId of candidates) {
      const id = await idOf(messageId);
      const entry = issues.find((candidate) => candidate.ids.includes(id));
      if (!entry) continue;
      const has = (kinds) => entry.notes.some((note) => kinds.includes(note.kind) && note.subject === id);
      if (!has(["reply-sent", "no-reply", "question-sent"])) {
        await entry.host.commentOnIssue(entry.issue.number, noteText("reply-sent", id, reply.date.slice(0, 10)));
        entry.notes.push({ kind: "reply-sent", subject: id, date: reply.date.slice(0, 10) });
      }
      break;
    }
  }
}

/** The address a reply to this mail goes to: its Reply-To, else its sender; null where it is missing or no address. */
function replyAddress(mail) {
  const address = mail.replyTo?.[0] ?? mail.from;
  return address && ADDRESS.test(address.address) ? address : null;
}

/**
 * storeReplies(mailbox, replies) -> Promise<{ id, draft, problem }[]> — each reply stored as a draft to its mail's reporter only,
 * subject `Re:` its subject, the original quoted below it. A mail without a usable reply address gets no draft and the problem
 * "not sendable". The mailbox's other errors pass unchanged.
 */
export async function storeReplies(mailbox, replies) {
  const stored = [];
  for (const { mail, body } of replies) {
    const to = replyAddress(mail);
    if (!to) { stored.push({ id: mail.id, draft: null, problem: NOT_SENDABLE }); continue; }
    const quoted = mail.text.split(/\r?\n/).map((line) => `> ${line}`).join("\n");
    try {
      const draft = await mailbox.storeDraft({ replyTo: mail, to, subject: `Re: ${mail.subject}`, body: `${body}\n\n${quoted}` });
      stored.push({ id: mail.id, draft, problem: null });
    } catch (error) {
      if (error?.name !== "NoReplyAddress") throw error;
      stored.push({ id: mail.id, draft: null, problem: NOT_SENDABLE });
    }
  }
  return stored;
}

/** The draft sent only as `shown`; the day it was sent. Errors of the mailbox pass unchanged and leave the draft. */
async function send(mailbox, shown) {
  const { sentAt } = await mailbox.sendDraft(shown);
  return sentAt.slice(0, 10);
}

/** sendReply(mailbox, host, issue, id, shown) — sends the draft only as shown, and only then notes `reply-sent` in the issue. */
export async function sendReply(mailbox, host, issue, id, shown) {
  const day = await send(mailbox, shown);
  await host.commentOnIssue(issue, noteText("reply-sent", id, day));
}

/** askReporter(mailbox, host, issue, id, shown) — sends a question as a reply is sent, labels the issue and notes the question; the issue stays open. */
export async function askReporter(mailbox, host, issue, id, shown) {
  const day = await send(mailbox, shown);
  await host.setIssueLabels(issue, { add: [issueLabels.waitingForReporter] });
  await host.commentOnIssue(issue, noteText("question-sent", id, day));
}

/** noReply(host, issue, id) — notes the decision not to answer a mail. */
export async function noReply(host, issue, id) {
  await host.commentOnIssue(issue, noteText("no-reply", id, today()));
}
