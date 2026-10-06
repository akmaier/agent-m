# 10. Review on GitHub Pages: a form opens with its first field focused

**The change.** `A FORM OPENS WITH ITS FIRST FIELD FOCUSED` is added after `EVERY STEP EXPLAINS ITSELF`. Every other
requirement of the section is carried over byte for byte.

**Why.** PO decision, 2026-10-06, after storing a token on the settings page on a phone: "When I click „store a token"
I want the focusing to jump to the first input field where I can enter this information. I think this should be part of
the specification as usability feature in general." On a phone, a form that opens without the focus in it leaves the
person to find the field, often a screen away, while the keyboard stays closed.

**Impact list.** One requirement added; no existing requirement changes and none names it yet. What follows for the code:
- the settings page's token form: its paste field takes the focus when the form opens, so it is enabled then. *Store
  token* stays disabled until the notice is ticked, so nothing is stored before it (`THE SHARED PAGES ORIGIN IS
  DISCLOSED`). `tests/test_settings_disclosure.py`, which requires the paste field to start disabled, then requires it of
  *Store token*;
- the form to change a GitLab project token, and the add-product panel's address field.
