#!/usr/bin/env python3
"""
Master E2E Test Runner for Antigravity skill: human-interface-design
Executes Tiers 1-4 tests with detailed tier reporting, filtering, and summary statistics.
Pure Python 3 standard library - zero external dependencies.
"""

import argparse
import json
import os
import sys
import time
import unittest
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Ensure current directory is in sys.path
TESTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(TESTS_DIR))

# Import test modules
import test_tier1_features
import test_tier2_boundaries
import test_tier3_combinations
import test_tier4_scenarios


class TierTrackingTestResult(unittest.TestResult):
    def __init__(self, stream=None, descriptions=None, verbosity=1, json_mode=False):
        super().__init__(stream=stream, descriptions=descriptions, verbosity=verbosity)
        self.stream = stream or sys.stdout
        self.verbosity = verbosity
        self.json_mode = json_mode
        self.tier_stats = {
            "Tier 1 (Feature Coverage)": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
            "Tier 2 (Boundaries & Corners)": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
            "Tier 3 (Cross Combinations)": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
            "Tier 4 (Real Scenarios)": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
        }
        self.test_details: List[Dict[str, Any]] = []

    def _get_tier_name(self, test: unittest.TestCase) -> str:
        mod = test.__class__.__module__
        if "tier1" in mod:
            return "Tier 1 (Feature Coverage)"
        elif "tier2" in mod:
            return "Tier 2 (Boundaries & Corners)"
        elif "tier3" in mod:
            return "Tier 3 (Cross Combinations)"
        elif "tier4" in mod:
            return "Tier 4 (Real Scenarios)"
        return "Other"

    def startTest(self, test):
        super().startTest(test)
        tier = self._get_tier_name(test)
        if tier in self.tier_stats:
            self.tier_stats[tier]["run"] += 1
        if not self.json_mode and self.verbosity >= 2:
            self.stream.write(f"[{tier}] {test._testMethodName} ... ")
            self.stream.flush()

    def addSuccess(self, test):
        super().addSuccess(test)
        tier = self._get_tier_name(test)
        if tier in self.tier_stats:
            self.tier_stats[tier]["passed"] += 1
        if not self.json_mode:
            if self.verbosity >= 2:
                self.stream.write("ok\n")
                self.stream.flush()
            elif self.verbosity == 1:
                self.stream.write(".")
                self.stream.flush()

    def addFailure(self, test, err):
        super().addFailure(test, err)
        tier = self._get_tier_name(test)
        if tier in self.tier_stats:
            self.tier_stats[tier]["failed"] += 1
        msg = str(err[1])
        self.test_details.append({
            "tier": tier,
            "test": test._testMethodName,
            "status": "FAIL",
            "message": msg,
        })
        if not self.json_mode:
            if self.verbosity >= 2:
                self.stream.write("FAIL\n")
                self.stream.flush()
            elif self.verbosity == 1:
                self.stream.write("F")
                self.stream.flush()

    def addError(self, test, err):
        super().addError(test, err)
        tier = self._get_tier_name(test)
        if tier in self.tier_stats:
            self.tier_stats[tier]["errors"] += 1
        msg = str(err[1])
        self.test_details.append({
            "tier": tier,
            "test": test._testMethodName,
            "status": "ERROR",
            "message": msg,
        })
        if not self.json_mode:
            if self.verbosity >= 2:
                self.stream.write("ERROR\n")
                self.stream.flush()
            elif self.verbosity == 1:
                self.stream.write("E")
                self.stream.flush()


def build_suite(tier_filter: str = "all", feature_filter: Optional[int] = None) -> unittest.TestSuite:
    suite = unittest.TestSuite()
    loader = unittest.TestLoader()

    # Determine which tiers to include
    include_t1 = tier_filter in ("1", "all")
    include_t2 = tier_filter in ("2", "all")
    include_t3 = tier_filter in ("3", "all")
    include_t4 = tier_filter in ("4", "all")

    # Tier 1
    if include_t1:
        t1_suite = loader.loadTestsFromTestCase(test_tier1_features.TestTier1Features)
        for test in t1_suite:
            if feature_filter is not None:
                pat = f"test_f{feature_filter:02d}_"
                if not test._testMethodName.startswith(pat):
                    continue
            suite.addTest(test)

    # Tier 2
    if include_t2:
        t2_suite = loader.loadTestsFromTestCase(test_tier2_boundaries.TestTier2Boundaries)
        for test in t2_suite:
            if feature_filter is not None:
                pat = f"test_f{feature_filter:02d}_"
                if not test._testMethodName.startswith(pat):
                    continue
            suite.addTest(test)

    # Tier 3
    if include_t3 and feature_filter is None:
        t3_suite = loader.loadTestsFromTestCase(test_tier3_combinations.TestTier3Combinations)
        suite.addTests(t3_suite)

    # Tier 4
    if include_t4 and feature_filter is None:
        t4_suite = loader.loadTestsFromTestCase(test_tier4_scenarios.TestTier4Scenarios)
        suite.addTests(t4_suite)

    return suite


def main():
    parser = argparse.ArgumentParser(
        description="Run E2E Test Suite for Antigravity skill: human-interface-design"
    )
    parser.add_argument(
        "--target-dir",
        type=str,
        default=r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design",
        help="Path to the target skill directory to test",
    )
    parser.add_argument(
        "--tier",
        type=str,
        choices=["1", "2", "3", "4", "all"],
        default="all",
        help="Filter execution to a specific test tier (1, 2, 3, 4, or all)",
    )
    parser.add_argument(
        "--feature",
        type=int,
        choices=range(1, 25),
        default=None,
        help="Filter Tier 1 & 2 tests to a specific feature ID (1-24)",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose test execution",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output structured JSON summary",
    )
    parser.add_argument(
        "--failfast", "-x",
        action="store_true",
        help="Stop on first failure",
    )

    args = parser.parse_args()

    # Set environment variable for test classes
    target_path = Path(args.target_dir).resolve()
    os.environ["TARGET_SKILL_DIR"] = str(target_path)

    verbosity = 2 if args.verbose else 1

    if not args.json:
        print("=" * 78)
        print(" Antigravity Skill E2E Test Suite: human-interface-design")
        print("=" * 78)
        print(f"Target Directory: {target_path}")
        print(f"Tier Selection:   {args.tier}")
        if args.feature:
            print(f"Feature Filter:   Feature {args.feature}")
        print(f"Target Exists:    {target_path.exists()}")
        print("-" * 78)

    suite = build_suite(tier_filter=args.tier, feature_filter=args.feature)
    total_planned = suite.countTestCases()

    if total_planned == 0:
        print("No tests matched the specified filter criteria.")
        sys.exit(0)

    result = TierTrackingTestResult(verbosity=verbosity, json_mode=args.json)
    if args.failfast:
        result.failfast = True

    start_time = time.time()
    suite.run(result)
    duration = time.time() - start_time

    if not args.json and verbosity == 1:
        print()  # newline after dots

    is_successful = result.wasSuccessful()

    if args.json:
        report = {
            "success": is_successful,
            "target_dir": str(target_path),
            "target_exists": target_path.exists(),
            "total_tests": result.testsRun,
            "passed": result.testsRun - len(result.failures) - len(result.errors),
            "failed": len(result.failures),
            "errors": len(result.errors),
            "duration_seconds": round(duration, 3),
            "tier_breakdown": result.tier_stats,
            "failures": [
                {"test": str(f[0]), "error": str(f[1])} for f in result.failures
            ],
            "errors_detail": [
                {"test": str(e[0]), "error": str(e[1])} for e in result.errors
            ],
        }
        print(json.dumps(report, indent=2))
    else:
        print("-" * 78)
        print(" EXECUTION SUMMARY")
        print("-" * 78)
        print(f"{'Tier':<35} | {'Run':<6} | {'Passed':<6} | {'Failed':<6} | {'Errors':<6}")
        print("-" * 78)
        for tier_name, stats in result.tier_stats.items():
            if stats["run"] > 0:
                print(
                    f"{tier_name:<35} | {stats['run']:<6} | {stats['passed']:<6} | {stats['failed']:<6} | {stats['errors']:<6}"
                )
        print("-" * 78)
        total_passed = result.testsRun - len(result.failures) - len(result.errors)
        print(
            f"Total Tests Run: {result.testsRun} | Passed: {total_passed} | Failed: {len(result.failures)} | Errors: {len(result.errors)}"
        )
        print(f"Total Duration:  {duration:.3f}s")
        print("=" * 78)

        if not is_successful:
            print("\n" + "!" * 78)
            print(" DIAGNOSTIC REPORT: FAILURES & ERRORS")
            print("!" * 78)
            for item in result.test_details:
                print(f"[{item['status']}] {item['tier']} :: {item['test']}")
                first_line = item['message'].strip().splitlines()[-1] if item['message'] else ""
                print(f"       Reason: {first_line}")
            print("!" * 78)
            print(f"\nFinal Result: FAILED (Exit Code 1)\n")
        else:
            print(f"\nFinal Result: ALL TESTS PASSED (Exit Code 0)\n")

    sys.exit(0 if is_successful else 1)


if __name__ == "__main__":
    main()
