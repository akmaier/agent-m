# §7: a used-up rate limit is named, not blamed on the token

**What happened, 2026-10-01 around 00:30 local time.** The PO reported "The github token broke. I can't use
agent m anymore". The dashboard showed "Could not read akmaier/agent-m @ main: 403 — …/commits/main" and the
hint "Without a token GitHub allows 60 API calls per hour and network …", although a token was stored.

**Diagnosis (as a data-flow path, `SOFTWARE_MAINTENANCE.md` §2.1).**
- The main agent's own `gh` call failed at 22:31 UTC with "HTTP 403: API rate limit exceeded for user ID
  10292261": the account's primary limit, 5,000 requests per hour shared by every token of the account —
  the dashboard's fine-grained token and the command line alike. Spent mostly by this session's agents,
  whose `gh pr checks --watch` polls CI every few seconds.
- At 22:32 UTC both limits were full again (account 5000/5000, this network without a token 60/60).
- `docs/assets/review-app.mjs`, the load error view: `limited = !GITLAB && /403|429/.test(e.message)` shows
  the no-token hint for any 403, whether a token is stored or not; `writeErrorText` reports any 403 on a
  write as "Your token cannot write to …". Neither reads the rate-limit headers — so a used-up limit reads
  as a broken token.

**Measured, 2026-10-01:** GitHub's API answers `Access-Control-Expose-Headers: … X-RateLimit-Limit,
X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset …` to `Origin:
https://akmaier.github.io` — the page can read them. gitlab.com sends `ratelimit-limit`, `ratelimit-remaining`,
`ratelimit-reset` but does not list them in `access-control-expose-headers` — the page cannot; GitLab's
limit is named without its reset time. GitHub's documentation: exceeding the primary limit gives "a `403` or
`429` response"; secondary limits may send `retry-after`.

**The change:** new rule `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`, placed after `AN EXPIRED TOKEN
IS NAMED AND ITS RENEWAL LINKED`. The rest of §7 is carried over byte for byte.

**Also, no SPEC change:** the main agent's agents stop polling CI with `--watch` and check at wide intervals;
the session's API use is what exhausted the PO's limit.

**Impact list:** new name; code: `docs/assets/review-core.mjs` (reading the headers) and `review-app.mjs` (the
two messages), with a failing test first, after acceptance; architecture: MOD-git-host (errors it returns) as
a one-line interface change.
