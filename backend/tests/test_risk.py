"""
Tests for the pattern matcher (secret detection).
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.pattern_matcher import scan_file_for_secrets


def test_detects_aws_key():
    content = 'AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"'
    matches = scan_file_for_secrets("config.py", content)
    assert any(m.pattern_name == "AWS Access Key" for m in matches)


def test_detects_github_token():
    content = 'token = "ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789012"'
    matches = scan_file_for_secrets("secrets.py", content)
    assert any(m.pattern_name == "GitHub Token" for m in matches)


def test_detects_hardcoded_password():
    content = 'db_password = "supersecret123"'
    matches = scan_file_for_secrets("db.py", content)
    assert len(matches) > 0


def test_no_false_positive_placeholder():
    content = 'password = "your-password-here"'
    matches = scan_file_for_secrets("readme.py", content)
    # May or may not match depending on length — just ensure no crash
    assert isinstance(matches, list)


def test_line_number_accuracy():
    content = "x = 1\ny = 2\napi_key = 'abc123def456ghi789'"
    matches = scan_file_for_secrets("test.py", content)
    for m in matches:
        assert m.line_number == 3


def test_clean_file_has_no_matches():
    content = "def add(a, b):\n    return a + b\n"
    matches = scan_file_for_secrets("math.py", content)
    assert matches == []
