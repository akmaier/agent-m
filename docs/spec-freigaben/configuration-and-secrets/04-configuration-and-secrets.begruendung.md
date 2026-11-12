# 7. Configuration and secrets: a CLI session works with its repository's token from an ignored file

**The change.**
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`: a Bridge also gives a repository token to the CLI session it starts
  for a job of that repository. Its check is unchanged.
- `NO MODEL READS A CREDENTIAL`: no credential is sent to a model, nor read through a tool **Agent M gives** a model. A
  CLI session's own tools are not Agent M's. Its check is unchanged.
- New `A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE`: the Bridge leaves the job's repository token in a
  file of the checkout that git ignores, and no other credential.
- New `A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE`: the session's input names the file and says to use the token
  without reading it; the token itself is in no input.

Every other byte of the section is carried over.

**Why.** akmaier, 2026-11-12: "The CLI has the complete checkout and can do everything like a regular claude or open
code session." "Your fear of handling the github token to the CLI agent is non-sense. You try to keep it out of the agent
at all cost. But they need to be able to operate. communicating with the bridge for github access is terrible. They
needs to follow agents.md. The current setup tries to create safety, but actually, the agents can just read the bridge
code and still get the token." "We don't want the token in the CLI sessions prompt, but passing the token with to the
cli session as a file that is gitignored and with the prompt not to read it is by far enough."

A CLI session runs on the person's own computer, as the person's coding agent, and pushes, opens pull requests, follows
CI and merges as any session of that agent does; its guidance is AGENTS.md. Holding the token back made it depend on
the Bridge for every request to the server without making the token unreachable. The file keeps the token out of the
model's input and out of every commit; the instruction not to read it keeps it out of the conversation.
