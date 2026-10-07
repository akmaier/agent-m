// The cost of a job (MOD-job-ledger, Interfaces: jobCost; Data: Cost).
//
// Module: MOD-job-ledger
//
// The cost the runtime reported; otherwise the reported tokens at the participant's declared price; otherwise unknown,
// with the usage (NO COST IS GUESSED) — never zero, never an estimate: a cost is given only where the runtime or the
// declared price makes one knowable.

/**
 * jobCost(usage: Usage | null, participant: Participant) -> Cost
 */
export function jobCost(usage, participant) {
  if (usage && usage.cost) {
    return { known: true, amount: usage.cost.amount, currency: usage.cost.currency, basis: "reported" };
  }
  const price = participant?.price;
  const hasTokens = usage && (usage.inputTokens != null || usage.outputTokens != null);
  if (hasTokens && price) {
    const amount = (usage.inputTokens ?? 0) * price.input + (usage.outputTokens ?? 0) * price.output;
    return { known: true, amount, currency: price.currency, basis: "usage at the declared price" };
  }
  return { known: false, usage: usage ?? null };
}
