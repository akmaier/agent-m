"""SPEC §10 AN INSTANCE IS A FORK OF AGENT M — the dashboard derives its repository from its address."""
import unittest

from jsrun import js


def target(host, path, search=""):
    return js(f"return core.deriveTarget({{hostname: '{host}', pathname: '{path}', search: '{search}'}});")


class InstanceTarget(unittest.TestCase):
    def test_fork_address_names_the_fork(self):
        self.assertEqual(target("reader.github.io", "/agent-m/"),
                         {"instance": "reader/agent-m", "repo": "reader/agent-m", "ref": "main"})

    def test_product_is_chosen_by_query_the_instance_stays(self):
        self.assertEqual(target("akmaier.github.io", "/agent-m/", "?repo=akmaier/dvd_database&ref=dev"),
                         {"instance": "akmaier/agent-m", "repo": "akmaier/dvd_database", "ref": "dev"})

    def test_local_serving_falls_back_to_upstream(self):
        self.assertEqual(target("127.0.0.1", "/")["instance"], "akmaier/agent-m")

    def test_malformed_repo_query_is_ignored(self):
        self.assertEqual(target("reader.github.io", "/agent-m/", "?repo=../../evil")["repo"], "reader/agent-m")


if __name__ == "__main__":
    unittest.main()
