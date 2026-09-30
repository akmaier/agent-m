# §7: jump host and remote sessions as settings

**PO, 2026-09-30:** *"We need to be able to configure the keys for this in the settings as well as the
hostname and the port range that the CLI sessions will use."*

**Interpretation by the main agent — correct it in the edit field if it is not what you meant:** "the keys"
are read as the keys the dashboard itself uses — each session's **bridge token**. The **SSH keys** of the two
tunnel ends are not proposed as browser settings: a web page cannot open SSH, so it could not use them, and
the browser's storage is readable by every Pages site of the same owner (`THE SHARED PAGES ORIGIN IS
DISCLOSED`), where a private SSH key to the jump host would be one more thing to lose. The SSH keys stay in
`~/.ssh` of the two machines; the generated commands name which key file each end uses. If you want the SSH
keys kept in the settings as well — for example to move them with the export —, say so, and a rule for it
follows.
