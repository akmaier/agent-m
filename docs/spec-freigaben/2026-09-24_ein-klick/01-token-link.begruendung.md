# The token page is prefilled; the one thing it cannot prefill is spelled out

Two new rules, both from the measurement on the queue's index page.

**`THE TOKEN LINK IS PREFILLED`.** A newcomer does not know that GitHub calls this a
"fine-grained personal access token", where the page is, or what *Contents* means. The link takes
them there with everything filled in except the repositories.

**`THE REPOSITORY CHOICE IS SPELLED OUT`.** The link cannot preselect repositories, and the page
then defaults to *All repositories*. Someone who just presses *Generate* would hand Agent M write
access to every repository they own, and `A TOKEN IS SCOPED TO WHAT IT WRITES` would be violated
without anyone noticing. Agent M therefore says, at exactly that moment: choose *Only select
repositories*, then select these, naming each one.

**Permissions shrink.** With accepting, editing and setup all done as direct commits, the dashboard
needs *Contents: read and write*; *Pull requests* is no longer needed for anything the dashboard
does. The link asks for no more than that.
