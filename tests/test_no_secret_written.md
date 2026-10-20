# No Secret Written Cases

The cases of `tests/test_no_secret_written.py`, for the two requirements whose Check sentence the SPEC words as this file: `NO SECRET IN THE REPOSITORY`
("a generated artifact containing a configured secret value fails the run") and `A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE` ("a configured
resource credential written into `docs/resources.md` fails the run; counter-proof: the secret's name alone passes"). Every secret value of a case
starts with `sk-live-` or `ghp_` and is a made-up text that stands in no other file of the repository.

**How a case reads.** `given` is its precondition. `input` holds the `mode` and what the mode needs:
- `commit`: the repository host of `alice/thesis-tool` connected with the configured secrets (`secrets`) and the token of the person (`token`, or none), and the
  `files` a run would commit — each `{ path, text }`, or `{ path, bytes }` for a file given as the bytes of a text — with its `message`. The network is a spy:
  it counts the requests that reach it and answers none of them.
- `list`: the text of a `docs/resources.md` (`text`), read with the resource schema of MOD-resource-list and checked with `resourceFindings`.

`expected` names only what the case asserts, out of: `refused` (the commit ended with the host's `SecretRefused`), `named` (the path the refusal names),
`requests` (`0`, or `"some"` for one or more: the commit went past the check to the server), `echoed` (whether the refusal's message or a finding repeats a
secret value), and, in the mode `list`, `errorRules` (the rules of the findings of kind `error`, in order).

## NO SECRET IN THE REPOSITORY

### A generated artifact that holds a configured secret value is refused, named by its path, before any request

```json
{
  "given": "The host of alice/thesis-tool is connected with the configured secret sk-live-0123456789abcdef and the person's token. A run would commit one generated artifact, a job record, whose text holds the secret value in its notes.",
  "input": {
    "mode": "commit",
    "secrets": ["sk-live-0123456789abcdef"],
    "token": "ghp_ALICEagentMtoken0123456789abcdef",
    "message": "Job JOB-20261019-0900-a1b2: end",
    "files": [{ "path": "docs/jobs/JOB-20261019-0900-a1b2.md", "text": "# Job\n\nThe agent was started with the key sk-live-0123456789abcdef and ended.\n" }]
  },
  "expected": { "refused": true, "named": "docs/jobs/JOB-20261019-0900-a1b2.md", "requests": 0, "echoed": false }
}
```

### Counter-proof: the same artifact without the value goes past the check to the server

```json
{
  "given": "The same host with the same configured secret. The run commits the same job record with the notes written without the value.",
  "input": {
    "mode": "commit",
    "secrets": ["sk-live-0123456789abcdef"],
    "token": "ghp_ALICEagentMtoken0123456789abcdef",
    "message": "Job JOB-20261019-0900-a1b2: end",
    "files": [{ "path": "docs/jobs/JOB-20261019-0900-a1b2.md", "text": "# Job\n\nThe agent was started with its key and ended.\n" }]
  },
  "expected": { "refused": false, "requests": "some" }
}
```

### A secret value among the bytes of a file is refused as well

```json
{
  "given": "The host is connected with the configured secret sk-live-0123456789abcdef. A run would commit a generated file given as bytes, whose bytes read as a text hold the value; another file of the same commit holds none.",
  "input": {
    "mode": "commit",
    "secrets": ["sk-live-0123456789abcdef"],
    "token": "ghp_ALICEagentMtoken0123456789abcdef",
    "message": "generated files",
    "files": [{ "path": "docs/notes.md", "text": "Nothing secret.\n" }, { "path": "docs/generated.log", "bytes": "token=sk-live-0123456789abcdef\n" }]
  },
  "expected": { "refused": true, "named": "docs/generated.log", "requests": 0, "echoed": false }
}
```

### The person's own token in an artifact is refused too

```json
{
  "given": "The host is connected with the person's token ghp_ALICEagentMtoken0123456789abcdef and no configured secret. A run would commit an artifact that quotes the token.",
  "input": {
    "mode": "commit",
    "secrets": [],
    "token": "ghp_ALICEagentMtoken0123456789abcdef",
    "message": "an artifact",
    "files": [{ "path": "docs/settings.md", "text": "Stored as ghp_ALICEagentMtoken0123456789abcdef in the browser.\n" }]
  },
  "expected": { "refused": true, "named": "docs/settings.md", "requests": 0, "echoed": false }
}
```

## A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE

### A configured resource credential written into docs/resources.md is an error of the list

```json
{
  "given": "The list of resources holds the compute resource alex, whose Secret column holds the value sk-live-0123456789abcdef where the name of a secret belongs.",
  "input": {
    "mode": "list",
    "text": "# Resources of thesis-tool\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| alex | compute | alex.nhr.fau.de | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | sk-live-0123456789abcdef |\n"
  },
  "expected": { "errorRules": ["A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE"], "echoed": false }
}
```

### Counter-proof: the secret's name alone passes, as a CI secret by name and as a key stored in the browser

```json
{
  "given": "The list holds the same resource twice over: once with the Secret column `ci:ALEX_KEY` (a CI secret by name), once with `browser` (a key stored in the browser), and once with the column left out.",
  "input": {
    "mode": "list",
    "text": "# Resources of thesis-tool\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| alex | compute | alex.nhr.fau.de | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | ci:ALEX_KEY |\n| beta | compute | beta.nhr.fau.de | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | browser |\n| gamma | compute | gamma.nhr.fau.de | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | — |\n"
  },
  "expected": { "errorRules": [] }
}
```

### A configured resource credential in docs/resources.md fails the commit of the list

```json
{
  "given": "The host is connected with the configured secret sk-live-0123456789abcdef (the credential of the resource alex). A run would commit docs/resources.md with that value in the Secret column.",
  "input": {
    "mode": "commit",
    "secrets": ["sk-live-0123456789abcdef"],
    "token": "ghp_ALICEagentMtoken0123456789abcdef",
    "message": "resources",
    "files": [{ "path": "docs/resources.md", "text": "# Resources of thesis-tool\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| alex | compute | alex.nhr.fau.de | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | sk-live-0123456789abcdef |\n" }]
  },
  "expected": { "refused": true, "named": "docs/resources.md", "requests": 0, "echoed": false }
}
```

### Counter-proof: the list that names the secret alone is committed

```json
{
  "given": "The same host and configured secret. The run commits docs/resources.md with `ci:ALEX_KEY` in the Secret column.",
  "input": {
    "mode": "commit",
    "secrets": ["sk-live-0123456789abcdef"],
    "token": "ghp_ALICEagentMtoken0123456789abcdef",
    "message": "resources",
    "files": [{ "path": "docs/resources.md", "text": "# Resources of thesis-tool\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| alex | compute | alex.nhr.fau.de | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | ci:ALEX_KEY |\n" }]
  },
  "expected": { "refused": false, "requests": "some" }
}
```
