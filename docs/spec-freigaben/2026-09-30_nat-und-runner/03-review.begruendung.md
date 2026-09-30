# §10: show a changed file against its last accepted text

**PO, 2026-09-30:** *"Now I have to review changed usecases. It would be great to have a diff of the previous
accepted and the update to review them quicker."*

One new rule; everything else in §10 is unchanged. The accepted text is fetched by the blob SHA the approval
record names (GitHub: `GET /repos/{owner}/{repo}/git/blobs/{sha}`; GitLab: the repository blob endpoint);
"most recent" is the approval record committed last for that identifier. Matching by identifier covers a
renamed file, whose older records name the old path.

Measured on 2026-09-30 for the ten use cases then shown as changed: each differs from its last accepted
text by one line — the front-matter key `stage:` renamed `area:`.
