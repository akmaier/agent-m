"""SPEC §6 A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK — the dashboard's side (UC-011 1c).

What this file checks: the reverse-tunnel command the dashboard writes binds the jump host's end to 127.0.0.1
explicitly, and the check that guards every written command refuses 0.0.0.0, `*`, an empty bind address and
any other non-loopback address (counter-proof).

What it does not check yet, and why: the SPEC also names this file for `REMOTE ACCESS TO THE BRIDGE GOES THROUGH A
TUNNEL` and `A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL` — the dashboard's request reaching the bridge
through a reverse and a forward tunnel over a test SSH server, and nothing answering without the forward. Those need
the bridge itself, and this repository has no bridge implementation yet (2026-09-30). They are added with the bridge;
a check that cannot run is not written as one that passes.
"""
import json
import unittest

from jsrun import js

JUMP = {"host": "jump.example.org", "user": "agentm", "portFrom": 20001, "portTo": 20010,
        "reverseKey": "~/.ssh/agent-m-jump", "forwardKey": "~/.ssh/id_ed25519"}


def commands(jump=JUMP, bridge_port=8765):
    return js(f"const j = {json.dumps(jump)}; const s = bridgeTunnel.addRemoteSession(j, [], {{ name: 'lab-pc', bridgePort: {bridge_port} }})[0];"
              "return bridgeTunnel.tunnelCommands(j, s);")


def problems(cmd: str) -> list:
    return js(f"return bridgeTunnel.tunnelBindProblems({json.dumps(cmd)});")


class ReverseTunnelOnLoopback(unittest.TestCase):
    def test_the_generated_reverse_command_names_the_loopback_address(self):
        c = commands()
        self.assertIn(" -R 127.0.0.1:20001:127.0.0.1:8765 ", c["reverse"] + " ")
        self.assertEqual(problems(c["reverse"]), [])
        self.assertEqual(problems(c["forward"]), [])
        for cmd in (c["reverse"], c["forward"]):
            self.assertNotIn("0.0.0.0", cmd)
            self.assertNotIn("*", cmd)

    def test_counter_proof_any_other_bind_address_fails(self):
        for bad in ("ssh -N -R 0.0.0.0:20001:127.0.0.1:8765 u@h", "ssh -N -R *:20001:127.0.0.1:8765 u@h",
                    "ssh -N -R :20001:127.0.0.1:8765 u@h", "ssh -N -R 20001:127.0.0.1:8765 u@h",
                    "ssh -N -R 10.0.0.5:20001:127.0.0.1:8765 u@h"):
            self.assertTrue(problems(bad), bad)

    def test_a_command_that_would_break_the_rule_is_never_written(self):
        # A jump-host name crafted to smuggle in a bind address is refused before any command is written.
        with self.assertRaises(AssertionError):
            commands({**JUMP, "host": "0.0.0.0:20001:127.0.0.1:8765 x@h -R"})


if __name__ == "__main__":
    unittest.main()
