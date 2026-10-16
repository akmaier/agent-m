---
id: ITM-530
title: The prompt bar's What is this? explains the bar
level: module
realises:
  - EVERY STEP EXPLAINS ITSELF
  - UC-049
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the gate of #571 (ITM-504, sprint team1/40), the Scrum Master's finding
  - MOD-prompt-bar, Interfaces: startPromptBar — "A folded *What is this?* explains the bar"
  - MOD-site-frame, Data: the explanations file
---
# ITM-530 The prompt bar's What is this? explains the bar

**REGISTER**

## Outcome

MOD-site-frame's `explanations.md` holds the topic `prompt-bar`, which the bar's folded *What is this?* shows through
`explain("prompt-bar")`. Today the file lacks it, and the bar's explanation is empty.

What the file leaves unstated, and what is built. The topic says, in a few sentences, from UC-049 and MOD-prompt-bar:
- the bar lets a person talk with a participant about the page shown;
- a message goes only to the participant named, at the processing place named before it is sent;
- the conversation is written to a repository only while recording conversations is switched on in the instance's
  settings;
- a draft or an edit the participant proposes changes nothing until the person saves it;
- work the tab cannot do is handed over only on the person's click.

No existing test's expected result changes, release tests included. The explanation tests of MOD-site-frame each name
their own topics, and the frame's check of named topics gains one topic that now exists.

## Acceptance

- `explain("prompt-bar")` gives a folded explanation whose text holds the five points above, each stated in the test's
  own text; a counter-proof without the topic gives none.
- The first commit holds only the test, and CI is red on it.
- Only `src/site-frame/explanations.md` and the tests that name MOD-site-frame change.
