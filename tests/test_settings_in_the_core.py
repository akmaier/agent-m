# Module: MOD-review-core
# Guards: THE SHARED PAGES ORIGIN IS DISCLOSED; UC-042
# Level: unit
"""SPEC §7 THE SHARED PAGES ORIGIN IS DISCLOSED (UC-042) — the part the kernel holds (docs/assets/review-core.mjs canStore).

Moved, unchanged, out of tests/test_settings_disclosure.py when it was split by module: the gate before anything is stored.
The commit of a product setting to the product's repository went back to tests/test_settings_page.py when the dashboard's
writes left the kernel (ITM-124).
"""
import unittest

from jsrun import js


class SettingsDisclosure(unittest.TestCase):
    def test_nothing_can_be_stored_before_acknowledging(self):
        self.assertEqual(js("return [core.canStore(false), core.canStore(true)];"), [False, True])


if __name__ == "__main__":
    unittest.main()
