---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ea4e36fb53eff2b3ec9c7989c6957c780d6fb8ff
  - https://github.com/akmaier/agent-m/pull/768
date: 2026-10-17 20:17 UTC
---
# Development → Release testing: ITM-819, Clear everything removes the kept file texts

**REGISTER**

## Reason

ITM-819, pull request #768 into `sprint/team1/76`, at head `ea4e36fb`. It is one commit of two new test files, +164, and
changes no code. Run 39065897821 is green. GitHub was still computing mergeability after ITM-711's merge.

**The lead is not a fault, and the item shows why.**
- `src/settings-pages/settings.mjs:416` calls `MOD-browser-store.clearEverything`. That removes every `localStorage` key
  under the instance's prefix (`src/browser-store/index.mjs:79-86`), named in the catalogue or not.
- The live app keeps no file text: since `d8c69b76`, read texts live only in the host's memory by blob, and
  `retireFileTexts` deletes the old cache at start-up.
- So UC-042's "removes all of Agent M's entries from `localStorage`" holds.

**The acceptance is met by tests, without a red.** The item's tests-first rule asks for a red only where the code must
change, and it does not. The tests pin the behaviour against its faults:
- **TST-819002 (unit).** Every instance entry is cleared, including two the catalogue does not name. Another instance's
  entry and another site's entry stay.
- **TST-819001 (component, with and without a token).** After *Clear everything* on the live page, no instance key and no
  Cache Storage remain. The press sends no request.
- **Four planted faults are caught:**
  - `file-text:` keys skipped;
  - only catalogue keys cleared;
  - the old cache not deleted;
  - a request after the clear.

**Readings accepted.**
- "All of Agent M's entries" is the instance's prefix, as MOD-browser-store gives it.
- Cache Storage is asserted too, under `A CLEAR IS A REAL CLEAR`'s "from the browser".

**Findings.**
- `load-per-view.test.mjs:352` reads the old handler's source. It is a reader for ITM-818, which may now drop it, since
  TST-819001 and 002 pin the live behaviour. This is noted in ITM-818.
- The open page may keep a cleared token in memory until a reload. This is registered as ITM-825, test first.
- The developer took its first `ls` late, which goes to the feedback.
