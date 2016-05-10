import unittest
from <%= taskNamespace %>.<%= utilsScriptName %> import capitalize


class <%= testName %>(unittest.TestCase):
    def test_capitalize_name(self):
        self.assertEqual('Foo', capitalize('foo'))
