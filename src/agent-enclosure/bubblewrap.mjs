// bubblewrap.mjs — Linux: the arguments with which `bwrap` starts an agent (MOD-agent-enclosure, Data; ARC-054).
//
// Module: MOD-agent-enclosure
//
// bubblewrap mounts in the order of its arguments, each over what is there: the whole file system read-only first, then a new /dev and /proc and a
// private /tmp, an empty folder over the person's home and over the user's runtime folder, then the agent's folders writable and the SSH agent's
// socket, and last an empty folder or /dev/null over each place that holds credentials, so that one inside a writable folder stays hidden. It mounts
// only over paths that exist; the caller leaves out a hidden place that does not.

/**
 * bubblewrapArgs({ personHome, writable, hidden, runtimeDir, socket, workdir }) -> string[] — the arguments before `--` and the command: the process in
 * a PID namespace of its own and a new session, ended with the Bridge; the person's home `personHome` and the user's runtime folder, where the session
 * bus and the GPG agent listen, replaced by empty ones; `writable` bound writable; the SSH agent's socket `socket`, where there is one, bound in;
 * `hidden` as `{ path, directory }`; the working folder `workdir`. Pure.
 */
export function bubblewrapArgs({ personHome, writable, hidden, runtimeDir, socket, workdir }) {
  return [
    "--die-with-parent", "--new-session", "--unshare-pid",
    "--ro-bind", "/", "/",
    "--dev", "/dev",
    "--proc", "/proc",
    "--tmpfs", "/tmp",
    "--tmpfs", personHome,
    ...(runtimeDir ? ["--tmpfs", runtimeDir] : []),
    ...writable.flatMap((path) => ["--bind", path, path]),
    ...(socket ? ["--bind", socket, socket] : []),
    ...hidden.flatMap(({ path, directory }) => (directory ? ["--tmpfs", path] : ["--ro-bind", "/dev/null", path])),
    "--chdir", workdir,
  ];
}
