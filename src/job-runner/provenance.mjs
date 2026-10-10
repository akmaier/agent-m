// What a job leaves behind (MOD-job-runner, Parts: provenance.mjs): the provenance lines of every commit it makes, and the
// text form of its round record.
//
// Module: MOD-job-runner

import { formatFinding } from "../text-tools/index.mjs";

/**
 * provenanceLines(job: { agentM: { version: string, commit: string }, jobId: string, kind: string, participant:
 * Participant, rounds: number, instruction: string | null }) -> string[] — the git trailers every commit a job makes
 * carries at the end of its message: the Agent M version and commit, the job, the kind, the participant and its model,
 * the number of correction rounds, and, where the kind has one, the person's instruction on one line.
 */
export function provenanceLines({ agentM, jobId, kind, participant, rounds, instruction }) {
  const lines = [
    `Agent-M-Version: ${agentM.version}, commit ${agentM.commit}`,
    `Agent-M-Job: ${jobId}`,
    `Agent-M-Kind: ${kind}`,
    `Agent-M-Participant: ${participant.name}`,
    `Agent-M-Model: ${participant.model ?? "none"}`,
    `Agent-M-Rounds: ${rounds}`,
  ];
  if (instruction) lines.push(`Agent-M-Instruction: ${instruction.replace(/\s*\n\s*/g, " ").trim()}`);
  return lines;
}

const count = (n) => (n === 0 ? "no finding" : n === 1 ? "1 finding" : `${n} findings`);

/**
 * roundsText(rounds: Round[], left: Finding[], forPerson: Finding[], stoppedBecause: string, limit: number) -> string —
 * the round record's text form, which MOD-job-ledger writes into the end of a job's record: under `## Rounds`, each round
 * with how many findings it had, each finding in its one form with how the drafter answered it beneath; then what is
 * left, why the loop stopped and its limit; then, where there are any, the findings a person decides, which were never
 * sent back.
 */
export function roundsText(rounds, left, forPerson, stoppedBecause, limit) {
  const lines = ["## Rounds", ""];
  for (const round of rounds) {
    lines.push(`### Round ${round.number} — ${count(round.findings.length)}`);
    for (const found of round.findings) {
      lines.push(`- ${formatFinding(found)}`);
      const answer = round.answers.find((each) => formatFinding(each.finding) === formatFinding(found));
      if (answer) lines.push(`  - ${answer.how}${answer.text ? `: ${answer.text}` : ""}`);
    }
    lines.push("");
  }
  lines.push(`Left: ${left.length ? count(left.length) : "none"} · stopped because: ${stoppedBecause} · limit: ${limit}`);
  if (forPerson.length) lines.push("", "For a person:", ...forPerson.map((found) => `- ${formatFinding(found)}`));
  return `${lines.join("\n")}\n`;
}
