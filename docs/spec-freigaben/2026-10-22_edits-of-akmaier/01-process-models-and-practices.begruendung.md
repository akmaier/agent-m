# 5. Process models and practices: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE

**The change.** Changed PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; the rest of the section is as the person wrote it.

**Why.** The human requires a conversation from browser-configured connections before any participant list exists or is read. The present all-participants wording makes that depend on a repository profile. Limit this existing requirement to its process-role concern; do not change role assignment, participant declarations, secrets, permissions or acceptance rules. Conversation connections do not acquire process roles merely by being offered in the bar.

**Impact list.**
- PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE: changed; named by UC-017, UC-048, ARC-046, MOD-participant-list, MOD-product-process, ITM-216, ITM-230, ITM-352, ITM-354, TST-1096001, TST-352001, TST-352007, TST-354001, TST-354002, TST-375001, TST-375005, TST-472421, TST-472422, TST-472424, TST-472425, TST-472436, TST-475029, TST-475030, TST-475031, TST-475032, TST-475033, TST-475034, TST-475035, TST-475036, TST-999001.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier), the human clarification recorded as the inputs of JOB-20261022-1229-78a0; linked source version 2026-10-11; draft prepared for akmaier's review; no human save or acceptance is recorded.

**Provenance.** Agent M unreleased at 87c4f1f851626b8459b64b34fd179e567dbef41c; participant po-sol; model gpt-6.1-sol; JOB-20261022-1229-78a0; draft dated 2026-10-22; one drafting round; no test, CI, browser or model request.

**Boundary.** The original anchor is ## 5. Process models and practices, requirement PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE. Its identifier and existing check are kept. Only its all-participants scope changes; all other bytes of that section are preserved. Browser-only conversation does not fill a product role, decide a process gate, or bypass the requirements for a repository-writing job.

**Principles.** Single responsibility: the process-role registry rule states process-role membership, not conversation startup. DRY: the existing rule is changed under its identifier, not contradicted by a second registry rule. KISS and YAGNI: no new participant type, role, provider exception or architecture is proposed. These choices follow chapter 10 Principles for Robust Architecture Under AI Acceleration and chapter 12 Design Guidelines: One Thing at a Time / KISS.
