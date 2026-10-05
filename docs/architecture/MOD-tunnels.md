---
id: MOD-tunnels
title: The Bridge's own SSH key and its tunnels to the jump host
folder: src/tunnels/
realises:
follows:
  - ARC-040
  - ARC-052
uses:
  - MOD-bridge-http.bridgeApi
  - MOD-bridge-http.BridgeHandlers
  - MOD-bridge-client.TunnelPlan
provides:
  - ensureKey
  - openTunnels
  - closeTunnels
  - tunnelState
  - tunnelHandlers
---
# MOD-tunnels The Bridge's own SSH key and its tunnels to the jump host

## Responsibility

It belongs to the Bridge (ARC-040). It opens and keeps the SSH connections a Bridge needs when a computer behind NAT is to
be reached (UC-011, UC-044): the reverse tunnel from that computer to the jump host, bound to the jump host's loopback
only (`A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL`, `A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S
LOOPBACK`), and the matching forward on the person's own computer — so that nobody types an SSH command (`THE BRIDGE OPENS
ITS TUNNELS ITSELF`). It makes and keeps the Bridge's own key pair (`THE BRIDGE CREATES ITS OWN SSH KEY`). It speaks SSH
with the ssh2 package inside the Bridge's process (ARC-052). It runs in Node, in the Bridge's main process.

## Parts

- `index.mjs` — the interface.
- `key.mjs` — the key pair.
- `tunnel.mjs` — one tunnel: connecting, forwarding, keeping alive, reopening.
- `handlers.mjs` — the `tunnels` route of the Bridge's API.

## Data

Files in the Bridge's per-user data folder, outside every repository:

- `ssh/id_ed25519` — the private key, made on first use, readable and writable by its owner only; it never leaves the
  computer and is part of no export.
- `ssh/id_ed25519.pub` — the public key, shown in the Bridge's window to be added to `~/.ssh/authorized_keys` of the
  jump host's user.
- `ssh/known-jump-hosts` — the host key of each jump host, kept from the first connection; a jump host that later shows
  another key is refused.

The tunnels themselves are read from the plans the Bridge's settings hold, in the format MOD-bridge-client defines
(`TunnelPlan`); their states live in memory.

## Interfaces

- `ensureKey(dataFolder: string) -> Promise<{ publicKey: string, fingerprint: string }>` — the Bridge's key pair, made
  the first time it is needed, an Ed25519 pair, its private key written readable by its owner only. Errors: `NotWritable`
  with the folder.
- `openTunnels(dataFolder: string, plans: TunnelPlan[], bridgePort: number) -> Promise<void>` — opens every tunnel of the
  plans and keeps it open: a reverse tunnel asks the jump host to listen on its loopback address at the plan's port and
  carries each connection there to the Bridge's own port on loopback; a forward listens on this computer's loopback at the
  plan's port and carries each connection to the jump host's loopback at the same port. Each connection sends SSH
  keepalives and is reopened after sleep or a change of network, with growing waits. It refuses a plan whose bind
  address on the jump host is not its loopback, with `NotLoopback`. Crosses the network to the jump host; a tunnel that
  cannot be opened does not stop the others, and its state says why.
- `closeTunnels() -> Promise<void>` — closes every tunnel, on pause, quit or a changed plan.
- `tunnelState() -> { name: string, kind: "reverse" | "forward", state: "open" | "opening" | "closed" | "failed", reason:
  string | null }[]` — each tunnel's state; the reasons are `auth-refused` — the jump host does not accept the Bridge's key;
  the window shows the public key again and what to do with it —, `host-unreachable`, `host-key-changed` — the jump host
  shows another key than the one kept; nothing is sent to it —, and `port-taken` — another session holds the port on the
  jump host.
- `tunnelHandlers` — the handler of the `tunnels` route of `bridgeApi`, of MOD-bridge-http's type `BridgeHandlers`: the
  states of `tunnelState`.

## Files

Reads and writes `ssh/id_ed25519`, `ssh/id_ed25519.pub` and `ssh/known-jump-hosts` in the Bridge's per-user data folder.
Writes no repository file.

## Uses

- `MOD-bridge-http.bridgeApi`, `MOD-bridge-http.BridgeHandlers` — the route it answers.
- `MOD-bridge-client.TunnelPlan` — the plan of a tunnel, the same the dashboard turns into commands for a computer
  without a Bridge, so both ends agree.
