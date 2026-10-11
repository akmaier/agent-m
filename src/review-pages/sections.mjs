// sections.mjs — the extra sections a descriptor names (MOD-review-pages, Parts): ITM-441 builds the architecture's due diligence and
// its rounds.
//
// Module: MOD-review-pages
//
// A REUSE DECISION RECORDS ITS DUE DILIGENCE; THE ROUNDS ARE COUNTED AND SHOWN. Nothing here reads or writes the repository: a section
// is drawn from the text or the rounds it is given.

import { renderArtifact } from "../markdown-render/index.mjs";

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

// The rounds of the job that drafted the architecture, as its record holds them: each round with its findings, each finding with the
// drafter's answer; a finding of the last round that no answer follows is left.
export function roundsSection(rounds) {
  const section = el("section", "rounds", el("h3", null, "Rounds"));
  const last = rounds[rounds.length - 1];
  let left = 0;
  for (const round of rounds) {
    const list = el("ul");
    for (const found of round.findings) {
      const answer = round.answers.find((each) => each.finding === found || findingText(each.finding) === findingText(found));
      const item = el("li", answer ? "finding" : round === last ? "finding left" : "finding", findingText(found), " ");
      if (answer) item.append(el("span", "answer", answerText(answer)));
      else if (round === last) { item.append(el("span", "answer", "left")); left += 1; }
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
