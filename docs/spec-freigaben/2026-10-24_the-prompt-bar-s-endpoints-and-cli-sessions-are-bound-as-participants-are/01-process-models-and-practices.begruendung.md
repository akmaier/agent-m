# 5. Process models and practices: the prompt bar's endpoints and CLI sessions are bound as participants are

**The change.** Added `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE`; the rest of the section
is as it stands.

**Why.** akmaier, 2026-10-22: "The notion "participant" is wrong; participants only exist in the implementation
workflows. We need the bar to reach endpoints to spawn jobs as well as CLI sessions to work on git. Therefore, it should
first read the configuration to reach endpoints and cli sessions. ... Endpoint and cli sessions need to be able to work at
meta level during spec and UC case before we go to architecture and implementation." On the SPEC: "One new sentence."
The sentence binds what the bar offers to every rule a participant is bound by — capabilities, place, model, restricted
sources, recording — without listing it among the participants or giving it a role.

**Impact list.**
- THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE: added; named by UC-049, MOD-job-ledger,
  ITM-1185, ITM-1186, ITM-1187, ITM-1188, ITM-1192.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier). The sentence was first committed straight into
SPEC.md as a draft (1407d9a7, its check fabc8b04) while the queue docs/spec-freigaben/2026-10-22_edits-of-akmaier was
withdrawn (1eea71a3, the Requirements page drew nothing with an entry open). It is moved here so that it is accepted as
every change of the SPEC is.
