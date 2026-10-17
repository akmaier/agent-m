// MOD-personal-data — the choice of the three participants that check a rewritten text. Pure.

import { differs, eligible } from "../participant-list/index.mjs";

const CHECKERS = 3;

/**
 * checkersFor(participants: Participant[], rewriter: Participant, places: string[]) -> { checkers: Participant[] } | { missing: string }
 * — three participants that draft text with a language model, each at one of `places`, none of them the rewriter or using its
 * model, and no two using one model: the first such three in the order given; or, when there are not three, a sentence naming
 * how many were found.
 */
export function checkersFor(participants, rewriter, places) {
  const { eligible: candidates } = eligible(participants, {
    capabilities: ["draft text"],
    places: [{ from: "the mailbox", allowed: places }],
    notLike: [rewriter],
  });
  const checkers = [];
  for (const candidate of candidates) {
    if (checkers.every((chosen) => differs(candidate, chosen))) checkers.push(candidate);
    if (checkers.length === CHECKERS) return { checkers };
  }
  return {
    missing: `Three checking participants are needed, each with its own model, none of them the rewriter ${rewriter.name} or using its model, at a place the mailbox allows; only ${checkers.length} found.`,
  };
}
