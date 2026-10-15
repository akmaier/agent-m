# Participants of this instance

Constructed participants; the routes name secrets, never their values.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| lab-runner | CI agent | example-model | 10000 | | run code and tests | this machine | ci runner:lab-linux secret RUNNER_KEY |
| reader | CI agent | example-model | 10000 | | read the repository | this machine | ci runner:read-only secret READER_KEY |
| bridge-agent | CLI agent | example-model | 10000 | | run code and tests | this machine | bridge lab agent codex |
