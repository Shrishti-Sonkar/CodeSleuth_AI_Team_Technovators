"""
Tests for the graph service.
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.graph_service import GraphService
from services.parser_service import FileAST, FunctionDef


def _make_ast(path, imports, functions=None) -> FileAST:
    ast = FileAST(path=path, language="Python", imports=imports, line_count=50, complexity=1.0)
    ast.functions = functions or []
    ast.classes = []
    return ast


def test_dependency_graph_nodes():
    svc = GraphService()
    asts = [
        _make_ast("main.py", ["utils"]),
        _make_ast("utils.py", []),
    ]
    repo_graph = svc.build(asts)
    G = repo_graph.dep_graph
    assert "main.py" in G.nodes
    assert "utils.py" in G.nodes


def test_dependency_edge_created():
    svc = GraphService()
    asts = [
        _make_ast("main.py", ["utils"]),
        _make_ast("utils.py", []),
    ]
    repo_graph = svc.build(asts)
    G = repo_graph.dep_graph
    assert G.has_edge("main.py", "utils.py")


def test_no_self_loops():
    svc = GraphService()
    asts = [_make_ast("main.py", ["main"])]  # self import
    repo_graph = svc.build(asts)
    G = repo_graph.dep_graph
    assert not G.has_edge("main.py", "main.py")


def test_call_graph_function_nodes():
    svc = GraphService()
    funcs = [
        FunctionDef(name="process", line_start=1, line_end=10, calls=["helper"]),
        FunctionDef(name="helper", line_start=12, line_end=20, calls=[]),
    ]
    asts = [_make_ast("app.py", [], functions=funcs)]
    repo_graph = svc.build(asts)
    G = repo_graph.call_graph
    assert "app.py::process" in G.nodes
    assert "app.py::helper" in G.nodes


def test_call_graph_edge():
    svc = GraphService()
    funcs = [
        FunctionDef(name="process", line_start=1, line_end=10, calls=["helper"]),
        FunctionDef(name="helper", line_start=12, line_end=20, calls=[]),
    ]
    asts = [_make_ast("app.py", [], functions=funcs)]
    repo_graph = svc.build(asts)
    G = repo_graph.call_graph
    assert G.has_edge("app.py::process", "app.py::helper")


def test_json_roundtrip():
    svc = GraphService()
    asts = [
        _make_ast("a.py", ["b"]),
        _make_ast("b.py", []),
    ]
    repo_graph = svc.build(asts)
    data = svc.to_json(repo_graph)
    restored = svc.from_json(data)
    assert restored.dep_graph.number_of_nodes() == repo_graph.dep_graph.number_of_nodes()
    assert restored.dep_graph.number_of_edges() == repo_graph.dep_graph.number_of_edges()
