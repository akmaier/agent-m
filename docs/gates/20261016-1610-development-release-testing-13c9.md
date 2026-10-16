---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0b706781a774bf7a571f1c6c247e9d298bd467d9
  - https://github.com/akmaier/agent-m/pull/599
date: 2026-10-16 16:10 UTC
---
# Development → Release testing: ITM-511, Recording conversations is switched on the settings page

**REGISTER**

## Reason

ITM-511, pull request #599 into `sprint/team1/47`, at head `0b706781`. developer-sonnet-a wrote it, as `47.md` assigns.
It lists the following as read in full: AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `47.md`,
MOD-settings-pages, MOD-site-frame, MOD-prompt-bar, UC-042 and UC-049.

1. **The tests-only commits are red.** Three tests-only commits come first, with nothing rewritten and no stub. The run
   on the last of them, `dbe57153` (38928681792), fails exactly the item's 18 tests:
   - TST-511001–010 on node (1);
   - TST-511101–106 on node (7);
   - TST-511201–202 on node (2).

   TST-511201's other part, that a token is never shown, already holds on the base, as a guard. The listing of
   `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38929539225. GitHub reports the pull request mergeable.
3. **The changes stay in the item's modules.**
   - `src/settings-pages/settings.mjs` (MOD-settings-pages) and the topic `recording-conversations` in
     `src/site-frame/explanations.md` (MOD-site-frame), and three new test files.
   - No existing test changes. 92 test files give the same nine failures as on the base, all from bridge-build packages
     that are not installed locally.
   - The fetch spy records only loopback requests.
   - The existing callers were read: `recordingOf`, `saveFile`, `checkProduct`, `credentialsFor` and `writeDocument`.
4. **The tests state their values, and each fault is caught.** Eleven planted faults are each caught.
5. **The Acceptance holds.**
   - Nothing is saved before *I have read this* and *Save*.
   - The notice names a public product, not a private one, and an unreadable one as "visibility not known".
   - *Switch off* saves `recording: off` and says that written records stay.
   - The file follows `recording.schema.md`.
   - No subject holds a stored value, also after *Show*.
   - The explanation is shown on the line.

## The two sentences of the item that met

The item says "No existing test's expected result changes", and the settings route's subject names each setting with
its state. A first version read the switch and every repository's visibility as the page was drawn. That failed three
existing tests: two expect the page to read only `docs/participants.md` as it is drawn
(`settings-pages-clear-names.test.mjs:128`, `settings-pages-mailbox-connected.test.mjs:205`), and one expects "will be
published" never to stand on the page for a private repository (`dashboard-shell.test.mjs:134`).

The pull request reads the switch when the tab that holds the line is shown, and builds the notice only on *Switch on*.
Until then, the subject says "Recording conversations is not read yet." This reading is taken. It meets both sentences:
- "not read yet" is a true state of the line;
- the frame's default subject is what the route has drawn (MOD-site-frame, Route);
- MOD-settings-pages asks for each setting's state, and nowhere that every tab is read before it is shown;
- no request is made for a tab the person has not opened, which no rule asks for.

The other readings are within the texts:
- *Switch off* also takes only a person's click (`THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`);
- the file is written whole, and refused on a changed blob;
- the line stands in the repositories' tab;
- the instance is named `owner/name`, and a product by its kept address.

## Taken up outside this gate

- **`tests/test_settings_disclosure.py` has no case for this switch.** It is the check SPEC.md names for `SWITCHING
  CONVERSATION RECORDING ON STATES WHAT FOLLOWS`, and MOD-settings-pages owns it. The rule is guarded by this item's node
  tests, but the named check does not cover it. ITM-553 adds the case.
- **MOD-settings-pages' Parts name `setup.mjs` and `resources.mjs`, which do not exist yet.** These are parts not yet
  built, not a defect of this item.
