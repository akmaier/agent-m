# 7. Configuration and secrets: THE PROMPT BAR IS USABLE BEFORE PARTICIPANT LISTS LOAD

**The change.** Added THE PROMPT BAR IS USABLE BEFORE PARTICIPANT LISTS LOAD; the rest of the section is as the person wrote it.

**Why.** The human's settings-first availability requirement is not stated by a current SPEC requirement. Browser-local configuration and a single settings page do not by themselves require the bar to work before repository participant loading. Make that one outcome explicit without a timing number, storage format, provider exception or architecture. Later reachable participants extend the offer without becoming an initial or continuing prerequisite. Existing declared-capability, model, destination-place, context-fit, restricted-data and no-secret requirements continue to apply; absent values are not guessed.

**Impact list.**
- THE PROMPT BAR IS USABLE BEFORE PARTICIPANT LISTS LOAD: added; nothing names it.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier), the human clarification recorded as the inputs of JOB-20261022-1229-78a0; linked source version 2026-10-11; draft prepared for akmaier's review; no human save or acceptance is recorded.

**Provenance.** Agent M unreleased at 87c4f1f851626b8459b64b34fd179e567dbef41c; participant po-sol; model gpt-6.1-sol; JOB-20261022-1229-78a0; draft dated 2026-10-22; one drafting round; no test, CI, browser or model request.

**Boundary.** The original anchor is ## 7. Configuration and secrets. The new requirement is added at its end; every existing requirement is byte-identical. This is a required user-visible outcome, not a rendering deadline, an implementation recipe, a new API, or permission to fabricate participant metadata. The browser must receive the eventual implementation on the default branch through the existing green-PR process; this package contains no implementation.

**Whole-SPEC consistency.** Process roles remain assigned from the one instance registry. The five participant types, declared capabilities and model, processing place, context-fit checks, disclosure before sending, restricted-source and mailbox restrictions, secrets remaining in the browser, recording switch, review gates and acceptance path are unchanged. A connection has no authority to act as a process-role holder merely because it is offered. Price may remain unknown under NO COST IS GUESSED. No duplicate rule for settings location, secret handling, text-only answers, bar placement or review-page activation is added.

**Precondition for the use-case edit.** The following is exact proposed replacement text for the identified UC-049 passages, held here for editing and human review only after both SPEC entries are accepted. UC-049 and its approval remain unchanged in this package. Its actor currently requires the instance list, which is why publishing that change against today's SPEC would be premature. This is not an architecture draft. UC-003's direct/Bridge setup, short tool test and text-only alternative, UC-044's pairing and optional addition as a process participant, and UC-017's process-role registration remain available.

**UC-049 Actors: replace the Participant bullet.**

> - **Participant** - a model endpoint, CLI agent or sandboxed agent configured in this browser and reachable directly or through a Bridge paired with this browser; additionally, a directly reachable participant offered by a repository participant list after that list has loaded.

**UC-049 Precondition: replace the first bullet.**

> - A model endpoint is configured in this browser (UC-003), or an offered CLI or sandboxed agent is reached through a Bridge paired with this browser (UC-044). No repository participant list needs to be configured or read before the prompt bar can be used.

**UC-049 Main flow: replace step 1.**

> 1. On every page of the dashboard, the prompt bar is attached to the bottom of the window and offers the reachable model endpoints, CLI agents and sandboxed agents configured in this browser before reading repository participant lists. Right above it, a small selector names the participant the bar talks to, with its declared processing place. With one offered, it is chosen and the selector only names it; with several, the author picks one. Participant lists load later and add their directly reachable participants without interrupting the conversation or making the existing offer wait. The selector states where messages go. A folded **What is this?** explains the bar, what it sends with a message, and why a subagent is not offered.

**UC-049 Main flow: add immediately after step 3, before step 4.**

>    Agent M uses the selected connection's declared model, capabilities, context size and processing place; it invents none of them. If information required for the message is missing, the bar names it and lets the author supply it in Settings without requiring a repository participant list. Nothing is sent until the existing capability, context-fit, destination and data-permission checks hold.

**UC-049 Alternative flows: replace 1a.**

> - **1a. No reachable connection is configured in this browser and no directly reachable repository participant has loaded.** The prompt bar is not shown. Settings explains that it appears once a model endpoint, CLI agent or sandboxed agent is configured and reachable from this browser, without requiring a repository participant list.

**UC-049 Alternative flows: add 1c after unchanged 1b.**

> - **1c. A repository participant list is missing, slow or cannot be read.** The prompt bar remains usable with the browser-configured connections. A list that becomes available later adds its directly reachable participants without interrupting the conversation.

**Unchanged UC-049 passages.** All other text, including the tool-capable and text-only branches, exclusion of subagents, content of page context, secret exclusion, context overflow, mailbox and source restrictions, sending on the person's click, proposal and saving path, recording, hand-over and Stop, remains as accepted. No missing field receives a guessed value. The detailed ownership and public interfaces are for architecture work only after the changed use case has been accepted.

**Principles.** Least astonishment: a browser-configured connection can be used without an unrelated repository read. Single responsibility: local conversation availability is separate from process-role membership. KISS/YAGNI: require only the clarified outcome, not a timing threshold, background scheduler, cache, new identity type or special model case. DRY: retain existing metadata and privacy requirements rather than restating or weakening them. Chapter 8 supplies the distinction between the user's need and an implementation assumption; chapters 10 and 12 supply these design principles.
