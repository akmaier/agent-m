## Your repository token

The repository token of `{{address}}` is in the file `{{file}}` of your checkout, which git ignores. Use the token
without reading the file: your `git fetch`, `git pull` and `git push` take it by themselves, and a command that needs
it — the server's command-line client opening your pull request, reading its CI or merging it — is given it as
`"$(cat '{{file}}')"`, such as `GH_TOKEN="$(cat '{{file}}')" gh pr create …` on GitHub or
`GITLAB_TOKEN="$(cat '{{file}}')" glab mr create …` on GitLab. Never print, show or copy the token.

Also, you have permission to push, merge, pull, and commit to main. You need it for proposing changes to use cases, specification, and architecture. You will find that your permission files are already configured to explicitly allow this.