# Module: MOD-bridge-client
# Guards: A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-011
# Level: unit
"""SPEC §6 A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK — the dashboard's side (UC-011 1c).

What this file checks: the reverse-tunnel command MOD-bridge-client's `tunnelCommands` writes binds the jump host's end to
127.0.0.1 explicitly, as the plan it carries out does, and the forward on the person's computer listens on its loopback too.
The check reads a command as ssh does — its options up to the destination — and fails a command with `0.0.0.0`, `*`, an
empty or a missing bind address, any other non-loopback address, or an option that lets other hosts connect (counter-proof).
"""
import json
import unittest

from jsrun import js

JUMP = {"hostname": "jump.example.org", "user": "agentm", "sshPort": 22, "portRange": [20001, 20010]}
KEYS = {"remote": "~/.ssh/agent-m-jump", "local": "~/.ssh/id_ed25519"}
LOOPBACK = {"127.0.0.1", "localhost", "[::1]"}
# The options of ssh that take an argument (ssh(1), SYNOPSIS): a word after one of them is its argument, not the destination.
WITH_ARGUMENT = set("BbcDEeFIiJLlmOoPpQRSWw")


def commands(jump=JUMP, bridge_port=8765) -> dict:
    """The commands of the session at the lowest free port of the jump host's range, as the dashboard writes them."""
    return js(f"const j = {json.dumps(jump)}; const port = bridgeClient.allocatePort(j.portRange, []);"
              f" return bridgeClient.tunnelCommands(j, {{ name: 'lab-pc', port }}, {bridge_port}, {json.dumps(KEYS)});")


def bind_problems(cmd: str) -> list:
    """What in an ssh command lets its forwards listen elsewhere than on the loopback: [] when every -R and -L binds its
    listening end to a loopback address, explicitly, and forwards to 127.0.0.1."""
    words, problems, forwards, i = cmd.split(), [], 0, 1
    while i < len(words) and words[i].startswith("-"):
        option, argument = words[i][1:2], words[i][2:] or (words[i + 1] if i + 1 < len(words) else "")
        if option == "g":
            problems.append("-g lets other hosts connect to the forwarded port")
        if option == "o" and argument.lower().startswith("gatewayports"):
            problems.append("GatewayPorts lets other hosts connect to the forwarded port")
        if option in ("R", "L"):
            forwards += 1
            parts = argument.split(":")
            if len(parts) != 4:
                problems.append(f"-{option} {argument}: no bind address — it must name 127.0.0.1")
            else:
                if parts[0] not in LOOPBACK:
                    problems.append(f"-{option} {argument}: binds {parts[0] or '(empty)'}, not the loopback address")
                if parts[2] != "127.0.0.1":
                    problems.append(f"-{option} {argument}: forwards to {parts[2]}, not to 127.0.0.1")
        i += 1 if words[i][2:] or option not in WITH_ARGUMENT else 2
    if not forwards:
        problems.append("no -R or -L in the command")
    return problems


class ReverseTunnelOnLoopback(unittest.TestCase):
    def test_the_generated_reverse_command_names_the_loopback_address(self):
        c = commands()
        self.assertIn(" -R 127.0.0.1:20001:127.0.0.1:8765 ", c["reverse"] + " ")
        self.assertEqual(bind_problems(c["reverse"]), [])
        self.assertEqual(bind_problems(c["forward"]), [])
        for cmd in (c["reverse"], c["forward"]):
            self.assertNotIn("0.0.0.0", cmd)
            self.assertNotIn("*", cmd)
        # The plans the Bridge's tunnels carry out bind the same loopback address.
        self.assertEqual([(p["direction"], p["bind"], p["remotePort"]) for p in c["plans"]],
                         [("reverse", "127.0.0.1", 20001), ("forward", "127.0.0.1", 20001)])

    def test_counter_proof_any_other_bind_address_fails(self):
        for bad in ("ssh -N -R 0.0.0.0:20001:127.0.0.1:8765 u@h", "ssh -N -R *:20001:127.0.0.1:8765 u@h",
                    "ssh -N -R :20001:127.0.0.1:8765 u@h", "ssh -N -R 20001:127.0.0.1:8765 u@h",
                    "ssh -N -R 10.0.0.5:20001:127.0.0.1:8765 u@h", "ssh -N -R 127.0.0.1:20001:10.0.0.2:8765 u@h",
                    "ssh -N -L 0.0.0.0:20001:127.0.0.1:20001 u@h", "ssh -N -L 20001:127.0.0.1:20001 u@h",
                    "ssh -N -g -L 127.0.0.1:20001:127.0.0.1:20001 u@h",
                    "ssh -N -o GatewayPorts=yes -R 127.0.0.1:20001:127.0.0.1:8765 u@h", "ssh -N u@h"):
            self.assertTrue(bind_problems(bad), bad)

    def test_the_check_reads_the_options_as_ssh_does(self):
        # Known positives of the reading itself: an option's argument is not the destination, and a word after the
        # destination is the remote command, not an option.
        self.assertEqual(bind_problems("ssh -N -p 22 -i ~/.ssh/k -R 127.0.0.1:20001:127.0.0.1:8765 u@h"), [])
        self.assertEqual(bind_problems("ssh -N -R127.0.0.1:20001:127.0.0.1:8765 u@h"), [])
        self.assertTrue(bind_problems("ssh -N -i ~/.ssh/k u@h -R 127.0.0.1:20001:127.0.0.1:8765"), "a -R after the destination forwards nothing")


if __name__ == "__main__":
    unittest.main()
