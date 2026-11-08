# 7. Configuration and secrets: a token may also go to its own server as that repository's CI secret

**The change.** The rule of `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` widens by one way out: beside the
authorisation header, a repository token may leave the browser sealed to the public key of one of its server's
repositories, as that repository's CI secret. Its name and every other byte of the section are carried over.

**Why.** akmaier, 2026-11-08: "I want to see how the UI tells me to copy the browser Token to the github secrect. I want
this with as few clicks as possible. (for the nemotron case)". The accepted UC-010 lets *Set up GitHub Actions* store the
product's token as `AGENT_M_TOKEN` from this browser in one click, which `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN
FROM A CI SECRET` requires the repository to hold. Read as it stands, the rule allows the token out only as a header, so
the click would break it; copying the token by hand to the same server's secrets page carries it to the same place, with
more clicks and the token shown on screen. The token still goes to no other server, and never in the clear.

**Impact list.**
- UC-010 (precondition, *Set up GitHub Actions*) and UC-049 4c rest on it; MOD-runtimes, MOD-settings-pages and
  MOD-prompt-bar are drafted for *Set up GitHub Actions* once this entry is accepted.
- Checks: `tests/repository-hosts-ci-secret.test.mjs` gains the case its check names; `tests/review-core.test.mjs`
  unchanged.

**Origin.** akmaier's order of 2026-11-08; the contradiction was found while drafting the architecture of UC-010.
