// sections.mjs — the extra sections a descriptor names (MOD-review-pages, Parts): ITM-441 builds the architecture's due diligence and
// its rounds.
//
// Module: MOD-review-pages
//
// A REUSE DECISION RECORDS ITS DUE DILIGENCE; THE ROUNDS ARE COUNTED AND SHOWN. Nothing here reads or writes the repository: a section
// is drawn from the text or the rounds it is given.

import { renderArtifact, showDifference } from "../markdown-render/index.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

// A decision's `## Due diligence` section, taken out of its text: { rest, section } — the text without the section, and the section
// (heading excluded), or null where the decision has none.
export function splitDueDiligence(body) {
  const found = /^## Due diligence[ \t]*\n([^]*?)(?=^## |(?![^]))/m.exec(body);
  if (!found) return { rest: body, section: null };
  return { rest: body.slice(0, found.index) + body.slice(found.index + found[0].length), section: found[1] };
}

// The due-diligence section as drawn on the review page: the candidates side by side in the table the decision holds.
export function dueDiligenceSection(section) {
  return el("section", "due-diligence", el("h4", null, "Due diligence"), renderArtifact(section));
}

// A finding in the compiler's form, as MOD-text-tools writes it: <artifact>:<line>: <kind>: <what> [<rule>] — <fix>.
const findingText = (found) => `${found.artifact}:${found.line}: ${found.kind}: ${found.what} [${found.rule}] — ${found.fix}`;
const answerText = (answer) => (answer.text ? `${answer.how}: ${answer.text}` : answer.how);

// Why the loop stopped, as the record's `Left:` line states it: "Left: … · stopped because: <why> · limit: <n>". null where the record
// has no such line.
export function stoppedBecause(recordText) {
  return /^Left: .*? · stopped because: (.+?) · limit: /m.exec(recordText ?? "")?.[1] ?? null;
}

// What is left, as the record's writer counts it (MOD-job-ledger appendToRecord): the findings of the last round, answered or not,
// unless the loop passed or checked nothing. Without a stated reason the writer's own default holds: passed if the last round has no
// finding, else the limit.
export const isLeft = (stopped, round, last) => round === last && !["passed", "not checked"].includes(stopped ?? (last.findings.length === 0 ? "passed" : "limit"));

// The rounds of the job that drafted the architecture, as its record holds them: each round with its findings, each finding with the
// drafter's answer; the findings of the last round are left unless the loop passed or checked nothing (`stopped`, why it stopped).
export function roundsSection(rounds, stopped = null) {
  const section = el("section", "rounds", el("h3", null, "Rounds"));
  const last = rounds[rounds.length - 1];
  let left = 0;
  for (const round of rounds) {
    const list = el("ul");
    for (const found of round.findings) {
      const answer = round.answers.find((each) => each.finding === found || findingText(each.finding) === findingText(found));
      const isOne = isLeft(stopped, round, last);
      const item = el("li", isOne ? "finding left" : "finding", findingText(found), " ");
      if (answer) item.append(el("span", "answer", answerText(answer)), " ");
      if (isOne) { item.append(el("span", "left-mark", "left")); left += 1; }
      list.append(item);
    }
    const count = round.findings.length;
    const block = el("section", "round", el("h4", null, `Round ${round.number} — ${count === 0 ? "no finding" : count === 1 ? "1 finding" : `${count} findings`}`), list);
    block.setAttribute("data-number", String(round.number));
    section.append(block);
  }
  section.append(el("p", "left-count", `Left: ${left === 0 ? "none" : left === 1 ? "1 finding" : `${left} findings`}`));
  return section;
}

// A SPEC change entry's sections, drawn from its view as MOD-spec-changes gives it: the section that holds now, the proposal, their difference, the
// rationale, the impact list, the other open proposals on the same section — [{ id, state }] — and the queue's order — [{ number, anchor, state }].
export function entrySections(view, others, order, hrefOf) {
  const impact = el("ul", "impact");
  for (const each of view.impact) impact.append(el("li", null, `${each.name} — ${each.change}${each.referencedBy.length ? `, named by ${each.referencedBy.join(", ")}` : ""}`));
  const otherList = el("ul", "others");
  for (const other of others) {
    const a = el("a", null, other.id);
    a.setAttribute("href", hrefOf(other.id));
    otherList.append(el("li", null, a, ` — ${other.state}`));
  }
  const orderList = el("ol", "order");
  for (const each of order) orderList.append(el("li", null, `${String(each.number).padStart(2, "0")} — ${each.anchor} (${each.state})`));
  return [
    el("section", "current", el("h3", null, "Now in the SPEC"), view.current ? renderArtifact(view.current.text) : el("p", null, "There is no such section yet.")),
    el("section", "proposal", el("h3", null, "The proposal"), renderArtifact(view.proposal.text)),
    el("section", "difference", el("h3", null, "Difference"), showDifference(view.current?.text ?? "", view.proposal.text)),
    el("section", "rationale", el("h3", null, "Why"), renderArtifact(view.rationale)),
    el("section", "impact-list", el("h3", null, "Impact list"), impact),
    el("section", "others-list", el("h3", null, "Other open proposals on this section"), otherList),
    el("section", "queue-order", el("h3", null, "The queue's order"), orderList),
  ];
}
