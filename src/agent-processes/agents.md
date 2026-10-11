# Supported coding agents

**REGISTER**

The local coding-agent CLIs Agent M supports, with their vendor-documented commands and platform guidance.

| Agent | Command | Version | Task | Login check | Key variable | Install macos | Install windows | Install linux |
|---|---|---|---|---|---|---|---|---|
| claude | claude | {"args":["--version"],"pattern":"(\\d+(?:\\.\\d+)+)"} | {"args":["-p","Reply with one word: ok."],"finalAnswer":"one word"} | {"args":["auth","status"],"loggedIn":{"exitCode":0},"login":"claude auth login"} | ANTHROPIC_API_KEY | https://code.claude.com/docs/en/overview | https://code.claude.com/docs/en/overview | https://code.claude.com/docs/en/overview |
| codex | codex | {"args":["--version"],"pattern":"(\\d+(?:\\.\\d+)+)"} | {"args":["exec","Reply with one word: ok."],"finalAnswer":"one word"} | {"args":["login","status"],"loggedIn":{"exitCode":0},"login":"codex login"} | CODEX_API_KEY | https://learn.chatgpt.com/docs/developer-commands | https://learn.chatgpt.com/docs/developer-commands | https://learn.chatgpt.com/docs/developer-commands |
| opencode | opencode | {"args":["--version"],"pattern":"(\\d+(?:\\.\\d+)+)"} | {"args":["run","--format","json","Reply with one word: ok."],"finalAnswer":"one word"} | {"args":["auth","list"],"loggedIn":{"contains":"credential"},"login":"opencode auth login"} | — | https://opencode.ai/docs/#install | https://opencode.ai/docs/#windows | https://opencode.ai/docs/#install |
