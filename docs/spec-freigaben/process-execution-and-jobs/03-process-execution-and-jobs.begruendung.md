# 13. Process execution and jobs: a cost is the reported one, or unknown

**The change.** `NO COST IS GUESSED`: the clause "or when the runtime reports usage and the connection it runs on declares a
price for its model" leaves the sentence. Every other byte of the section is carried over.

**Why.** akmaier agreed on 2026-11-09 that no price is declared anywhere: a job's cost is the one its runtime reports, or
unknown. The clause names a price no connection declares any more, so it could never apply.

**Impact list.** `NO COST IS GUESSED` is named by UC-036, UC-043 and UC-049, ARC-046, MOD-job-ledger (`jobCost(usage)`,
already without a price) and MOD-main-page; its check `tests/test_job_cost.py` is unchanged.

**Origin.** github.com/akmaier, agreed on 2026-11-09 through the coordinating session.
