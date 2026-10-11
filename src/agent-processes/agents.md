# Supported coding agents

**REGISTER**

The local coding-agent CLIs Agent M supports, with their vendor-documented commands and platform guidance.

| Agent | Command | Version | Task | Login check | Key variable | Install macos | Install windows | Install linux |
|---|---|---|---|---|---|---|---|---|
| claude | claude | {"args":["--version"],"pattern":"(\\d+(?:\\.\\d+)+)"} | {"args":["-p","{prompt}"],"finalAnswer":{"format":"text","oneWord":true}} | {"args":["auth","status"],"loggedIn":{"exitCode":0},"login":"claude auth login"} | ANTHROPIC_API_KEY | https://code.claude.com/docs/en/setup | https://code.claude.com/docs/en/setup | https://code.claude.com/docs/en/setup |
| codex | codex | {"args":["--version"],"pattern":"(\\d+(?:\\.\\d+)+)"} | {"args":["exec","{prompt}"],"finalAnswer":{"format":"text","oneWord":true}} | {"args":["login","status"],"loggedIn":{"exitCode":0},"login":"codex login"} | CODEX_API_KEY | https://learn.chatgpt.com/docs/codex/cli | https://learn.chatgpt.com/docs/codex/cli | https://learn.chatgpt.com/docs/codex/cli |
| opencode | opencode | {"args":["--version"],"pattern":"(\\d+(?:\\.\\d+)+)"} | {"args":["run","--format","json","{prompt}"],"finalAnswer":{"format":"json-lines","eventType":"text","path":["part","text"],"oneWord":true},"usage":{"eventType":"step_finish","path":["part","tokens"],"input":"input","output":"output"}} | {"args":["auth","list"],"loggedIn":{"countPattern":"(\\d+)\\s+credentials?","minimumCount":1},"login":"opencode auth login"} | — | https://opencode.ai/docs/#install | https://opencode.ai/docs/#windows | https://opencode.ai/docs/#install |
