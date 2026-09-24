# `NO SERVER` stays; only its check names the new origins

The rule itself is untouched — there is still no server of the project. Its check lists the origins
the built site may call; a GitLab product adds that product's server. Without this line, the first
GitLab product would make the check fail for a reason the rule does not care about.
