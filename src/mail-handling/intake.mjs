// Reading new mail without the decided ones, and carrying out a person's decision on a mail.
// Module: MOD-mail-handling

import { listedMailIds, noteText, threadMatch, undecided, withMailIds, issueLabels } from "../mail-records/index.mjs";
import { peopleIn, personHits } from "../personal-data/index.mjs";

/** The labels an issue from a mail may carry (AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE). */
const MAIL_LABELS = [issueLabels.defect, issueLabels.change];

/** Today's calendar date, `YYYY-MM-DD`, as a note names it. */
const today = () => new Date().toISOString().slice(0, 10);

/**
 * A host's `Issue` as MOD-mail-records reads an issue: a comment's `date` is its `createdAt`.
 * @param {{ number: number, body: string, comments: { body: string, date: string }[] }} issue
 */
const issueText = (issue) => ({
  number: issue.number,
  body: issue.body,
  comments: issue.comments.map((comment) => ({ body: comment.body, createdAt: comment.date })),
});

/** The addresses of every header of a mail, and its text: what MOD-personal-data reads of a mail. */
const mailText = (mail) => ({
  addresses: [mail.from, ...mail.replyTo, ...mail.to, ...mail.cc],
  text: mail.text,
});

/**
 * readNewMail(mailbox, products, marked) -> Promise<NewMail> — reads the mailbox first and changes nothing in it; then the
 * issues of every product and the identifiers they list. A mail an issue lists or this browser marked is left out and counted
 * in `decided`. A mail whose In-Reply-To or References name a listed mail is attached to that issue by a `mail-added` note,
 * without a participant, and the issue is neither reopened nor relabelled. An issue that cannot be written to is named in
 * `unwritten`, and its mail stays proposable. The mailbox's and the hosts' errors pass unchanged.
 * @param {{ read: (since: string | null) => Promise<object[]> }} mailbox
 * @param {{ address: string, host: object }[]} products
 * @param {string[]} marked
 */
export async function readNewMail(mailbox, products, marked) {
  const mails = await mailbox.read(null);

  const listed = new Set();
  const threads = [];
  for (const { address, host } of products) {
    const byMail = new Map();
    for (const issue of await host.listIssues({ state: "all" })) {
      for (const id of listedMailIds(issueText(issue))) {
        listed.add(id);
        if (!byMail.has(id)) byMail.set(id, issue.number);
      }
    }
    threads.push({ address, host, byMail });
  }

  const open = new Set(undecided(mails.map((mail) => mail.id), listed, new Set(marked)));
  const result = { proposable: [], attached: [], decided: mails.length - open.size, unwritten: [] };
  for (const mail of mails.filter((candidate) => open.has(candidate.id))) {
    let match = null;
    for (const thread of threads) {
      const issue = await threadMatch(mail, thread.byMail);
      if (issue !== null) { match = { thread, issue }; break; }
    }
    if (match) {
      try {
        await match.thread.host.commentOnIssue(match.issue, noteText("mail-added", mail.id, today()));
        result.attached.push({ id: mail.id, product: match.thread.address, issue: match.issue });
        continue;
      } catch (error) {
        result.unwritten.push({ product: match.thread.address, issue: match.issue, error: error?.name ?? "Error" });
      }
    }
    result.proposable.push({ mail, people: peopleIn(mailText(mail)) });
  }
  return result;
}

/**
 * decideMail(mail, decision, host) -> Promise<{ issue: number | null }> — carries out the person's one click on a mail.
 * `create` searches the title and the text once more for the mail's people and refuses with `PersonFound` on a hit, writing
 * nothing; otherwise it creates one issue labelled `defect` or `change` whose text ends with the mail's identifier. `add`
 * lists the mail on an existing issue by one `mail-added` note. `not-an-issue` is another item's (ITM-956): it throws a
 * TypeError and writes nothing. The host's errors pass unchanged.
 * @param {{ id: string, people: object }} mail
 * @param {{ kind: string }} decision
 * @param {object | null} host
 */
export async function decideMail(mail, decision, host) {
  switch (decision?.kind) {
    case "create": return create(mail, decision, host);
    case "add": return add(mail, decision, host);
    case "not-an-issue":
      throw new TypeError("decideMail: the decision not-an-issue is not carried out yet; the mark is ITM-956's.");
    default:
      throw new TypeError(`decideMail: ${JSON.stringify(decision?.kind)} is not a decision (create, add, not-an-issue).`);
  }
}

function needHost(host, kind) {
  if (!host) throw new TypeError(`decideMail: the decision ${kind} needs the product's host.`);
}

async function create(mail, { title, text, label }, host) {
  needHost(host, "create");
  if (!MAIL_LABELS.includes(label)) {
    throw new TypeError(`decideMail: an issue from a mail is labelled ${MAIL_LABELS.join(" or ")}, not ${JSON.stringify(label)}.`);
  }
  const hits = [...personHits(title, mail.people), ...personHits(text, mail.people)];
  if (hits.length) {
    throw Object.assign(new Error(`The text names the mail's people: ${hits.map((hit) => hit.value).join(", ")}.`), { name: "PersonFound", hits });
  }
  const created = await host.createIssue({ title, body: withMailIds(text, [mail.id]), labels: [label] });
  return { issue: created.number };
}

async function add(mail, { issue }, host) {
  needHost(host, "add");
  await host.commentOnIssue(issue, noteText("mail-added", mail.id, today()));
  return { issue };
}
