# 7. Configuration and secrets: the destination check names the tests that check it

**The change.** In `THE PAGE NAMES WHERE IT SENDS`, the *Check* now names `tests/site-frame-run-panel.test.mjs` and
`tests/prompt-bar.test.mjs` in place of `tests/test_destination_disclosure.py`. The requirement's text is unchanged, and
so is the check's description: "before a run and before a message of a conversation is sent, the page names each
destination, a participant with its processing place; counter-proof: a participant shown without its place fails".

**Why.** ITM-528 asks for the check that the requirement describes, and the file now named cannot hold it.
- `tests/test_destination_disclosure.py` names `MOD-git-host` in its header, and the accepted architecture has no such
  module.
- It tests `docs/assets/git-host.mjs`, its `TOKEN_DESTINATIONS` and the token's headers, which no module owns.
- So under `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`, no implementation job may change it. Writing a run's or a
  conversation's destinations into it is none of the kinds that rule allows between jobs.

The tests named instead already check what the description says, in modules that own them:
- `tests/site-frame-run-panel.test.mjs` (MOD-site-frame). TST-472846 checks that every destination of the run panel
  names its participant, role, model and place. The review pages show that panel before a run (`runPanel`, called in
  `src/review-pages/jobs.mjs`).
- `tests/prompt-bar.test.mjs` (MOD-prompt-bar). The test "startPromptBar — one participant is named, several are chosen
  among, each with its processing place; a subagent never" checks what the bar names before a message is sent.

**Against the rest of the SPEC.** It changes no requirement, only which files check one. Both tests state the places
they expect in their own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`).
`tests/test_destination_disclosure.py` stays as it is. Its other guard, `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`,
is not touched.

**Impact list.**
- `tests/site-frame-run-panel.test.mjs` still names the withdrawn `THE PAGE STATES WHAT IT SENDS WHERE` in its headers.
  ITM-528 renames it.
- `tests/prompt-bar.test.mjs` already names `THE PAGE NAMES WHERE IT SENDS`.
