// The cost of a job (MOD-job-ledger, Interfaces: jobCost; Data: Cost).
//
// Module: MOD-job-ledger
//
// The cost the runtime reported; otherwise unknown, with the usage (NO COST IS GUESSED) — never zero, never an estimate.

/**
 * jobCost(usage: Usage | null) -> Cost
 */
export function jobCost(usage) {
  if (usage && usage.cost) {
    return { known: true, amount: usage.cost.amount, currency: usage.cost.currency, basis: "reported" };
  }
  return { known: false, usage: usage ?? null };
}
