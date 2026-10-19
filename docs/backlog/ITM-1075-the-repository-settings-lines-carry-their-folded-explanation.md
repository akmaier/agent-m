---
id: ITM-1075
title: The repository settings' lines carry their folded explanation
level: module
realises:
  - UC-042
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
  - ITM-1042
tests:
  - unit
origin:
  - ITM-1042's pull request #1023 (sprint team1/93), from developer-sonnet-a's open point
---
# ITM-1075 The repository settings' lines carry their folded explanation

**REGISTER**

## Outcome

UC-042.md:103: "Every section and every line carries a folded **What is this?**: what the setting is for, where it is …".
ITM-1042 draws the instance's and the product's repository settings as lines with a summary and *Edit*, without these
explanations. Their topics belong in `src/site-frame/explanations.md`, a file of MOD-site-frame.

## Acceptance

- Each section of repository settings and each of its lines carries its folded explanation, whose topic the explanations
  file holds. A test shows it, with a counter-proof: a line without its topic fails it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
