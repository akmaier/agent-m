# Module: MOD-test-document
# Guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
# Level: unit
"""The code tests/jsrun.py hands node has no length limit of an argument.

A test of any language reaches a module through `jsrun.js`, and a release test can name every repository path in its
code. A process takes one argument of at most 131,072 bytes on Linux (MAX_ARG_STRLEN) and all arguments together at most
`getconf ARG_MAX` bytes on macOS, so the code is given to node on its standard input.
"""
import errno
import subprocess
import unittest

from jsrun import js

ARG_LIMIT = int(subprocess.run(["getconf", "ARG_MAX"], capture_output=True, text=True, check=True).stdout)


class CodeLongerThanAnArgument(unittest.TestCase):
    # TST-1001001 · level: unit · module: MOD-test-document
    # guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
    # given: a JavaScript expression of 300,000 bytes, longer than the 131,072 bytes one argument may hold on Linux, ending in a return of 7 after a top-level await
    # input: js of the expression
    # expect: 7, and no OSError "Argument list too long"
    def test_code_longer_than_one_argument_is_run(self):
        expr = "/*" + "x" * 299_900 + "*/ await 0; return 7;"
        self.assertGreater(len(expr), 131_072)
        self.assertEqual(js(expr), 7)

    # TST-1001002 · level: unit · module: MOD-test-document
    # guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
    # given: module code longer than getconf ARG_MAX and than 131,072 bytes, so that no platform takes it as an argument
    # input: the code as the argument of `node --input-type=module -e`, the way jsrun.js handed it before; and the same expression through js
    # expect: the argument path raises OSError with errno E2BIG; js returns 7
    def test_the_argument_path_fails_where_standard_input_does_not(self):
        size = max(ARG_LIMIT, 131_072) * 2
        code = "/*" + "x" * size + "*/ process.stdout.write('7');"
        with self.assertRaises(OSError) as raised:
            subprocess.run(["node", "--input-type=module", "-e", code], capture_output=True, text=True)
        self.assertEqual(raised.exception.errno, errno.E2BIG)
        self.assertEqual(js("/*" + "x" * size + "*/ return 7;"), 7)


if __name__ == "__main__":
    unittest.main()
