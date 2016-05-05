import sys
import unittest

test_suite = sys.argv[1]

loader = unittest.TestLoader()
suite = loader.discover(start_dir=test_suite)

results = unittest.TextTestRunner(verbosity=2).run(suite)
if not results.wasSuccessful():
    sys.exit(1)
