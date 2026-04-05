"""
Tests for the parser service — Python AST parsing.
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.parser_service import ParserService


parser = ParserService()

SAMPLE_PYTHON = '''
import os
from pathlib import Path

class FileProcessor:
    def __init__(self, path: str):
        self.path = path

    def read(self) -> str:
        return Path(self.path).read_text()

def process_all(dir: str) -> list:
    """Process all files in a directory."""
    files = os.listdir(dir)
    results = []
    for f in files:
        p = FileProcessor(f)
        results.append(p.read())
    return results
'''


def test_python_imports():
    result = parser.parse("test.py", SAMPLE_PYTHON, "Python", 20)
    assert "os" in result.imports
    assert "pathlib" in result.imports


def test_python_functions():
    result = parser.parse("test.py", SAMPLE_PYTHON, "Python", 20)
    func_names = [f.name for f in result.functions]
    assert "process_all" in func_names


def test_python_classes():
    result = parser.parse("test.py", SAMPLE_PYTHON, "Python", 20)
    class_names = [c.name for c in result.classes]
    assert "FileProcessor" in class_names


def test_python_complexity():
    result = parser.parse("test.py", SAMPLE_PYTHON, "Python", 20)
    # process_all has a for loop → complexity >= 2
    func = next((f for f in result.functions if f.name == "process_all"), None)
    assert func is not None
    assert func.complexity >= 2


def test_unknown_language_no_error():
    result = parser.parse("style.css", "body { margin: 0; }", "CSS", 1)
    assert result.error is None


def test_syntax_error_handled():
    result = parser.parse("bad.py", "def foo(:\n    pass", "Python", 2)
    assert result.error is not None
