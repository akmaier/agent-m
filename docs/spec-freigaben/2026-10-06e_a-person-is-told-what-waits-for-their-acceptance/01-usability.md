## 16. Usability

**ONE CLICK PER DECISION** *(PO A. Maier)*
A decision a person makes on the dashboard — accept, save, add a product, release — takes one click
once its inputs are complete, and everything that follows from it is done by Agent M.
*Check:* no automatic check; at review of each use case.

**A FORM OPENS WITH ITS FIRST FIELD FOCUSED** *(PO A. Maier)*
When a person's action opens or shows a form on the dashboard, the input focus moves to the first field of that form that
is open for the person's input — a box to tick or a field to fill in.
*Check:* `tests/dashboard-review-flows.test.mjs` — after each control that opens a form — *Store a token* and *Change* on
the settings page, *Change* of a GitLab project token, *+ Add product* — the focus is in that form's first open field: on the
token form the notice's box *I have read this* while it is not ticked, the paste field once it is; counter-proof: with the
focus left on the control that opened it, the case fails.

**A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE** *(PO A. Maier)*
While a page of the dashboard is open in a browser where the person has switched notifications on, the browser shows a
notification when a SPEC change, a use case, an architecture file or a release test report comes to wait for the person's
acceptance.
*Check:* `tests/dashboard-notifications.test.mjs` — between two checks of a fixture instance, a newly open use case and a
newly open SPEC change yield one notification each, naming the file and linking the page where it is accepted; counter-proof:
a file already notified, or notifications switched off, yields none.

**NOTIFICATIONS ARE SWITCHED ON BY THE PERSON** *(PO A. Maier)*
The dashboard asks the browser's permission to show notifications only on the person's click that switches them on in the
settings.
*Check:* `tests/dashboard-notifications.test.mjs` — no page of the dashboard asks for the permission before that click;
counter-proof: the click asks once.
