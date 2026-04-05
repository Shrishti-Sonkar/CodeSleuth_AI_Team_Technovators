"""
Graph Service — builds NetworkX dependency and call graphs from parsed ASTs.
Serializes to/from JSON for disk persistence.
"""
import json
from pathlib import Path
from dataclasses import dataclass, field
import networkx as nx

from services.parser_service import FileAST
from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class RepoGraph:
    dep_graph: nx.DiGraph = field(default_factory=nx.DiGraph)   # file → file (imports)
    call_graph: nx.DiGraph = field(default_factory=nx.DiGraph)  # function → function


class GraphService:
    def build(self, asts: list[FileAST]) -> RepoGraph:
        repo_graph = RepoGraph()
        G_dep = repo_graph.dep_graph
        G_call = repo_graph.call_graph

        # Index all known file paths and function names
        file_paths = {ast.path for ast in asts}
        func_index: dict[str, str] = {}  # func_name → file_path
        for ast in asts:
            for func in ast.functions:
                func_index[func.name] = ast.path

        # Build dependency graph (file → file via imports)
        for ast in asts:
            G_dep.add_node(
                ast.path,
                label=Path(ast.path).name,
                language=ast.language,
                lines=ast.line_count,
                complexity=ast.complexity,
                node_type="file",
                functions=[f.name for f in ast.functions],
                classes=[c.name for c in ast.classes],
            )
            for imp in ast.imports:
                # Resolve import → file path (best-effort)
                resolved = self._resolve_import(imp, ast.path, file_paths)
                if resolved and resolved != ast.path:
                    G_dep.add_edge(ast.path, resolved, edge_type="imports", weight=1.0)

        # Build call graph (function → function)
        for ast in asts:
            for func in ast.functions:
                func_id = f"{ast.path}::{func.name}"
                G_call.add_node(
                    func_id,
                    label=func.name,
                    file_path=ast.path,
                    line_start=func.line_start,
                    line_end=func.line_end,
                    complexity=func.complexity,
                    node_type="function",
                )
                for callee in func.calls:
                    if callee in func_index:
                        callee_id = f"{func_index[callee]}::{callee}"
                        if callee_id != func_id:
                            G_call.add_edge(func_id, callee_id, edge_type="calls", weight=1.0)

        logger.info(
            f"Graph built: dep={G_dep.number_of_nodes()}n/{G_dep.number_of_edges()}e "
            f"call={G_call.number_of_nodes()}n/{G_call.number_of_edges()}e"
        )
        return repo_graph

    def _resolve_import(self, imp: str, source_file: str, known_files: set[str]) -> str | None:
        """Try to match an import string to a known file path."""
        # Python: "services.repo_service" → "services/repo_service.py"
        candidates = [
            imp.replace(".", "/") + ".py",
            imp.replace(".", "/") + ".js",
            imp.replace(".", "/") + ".ts",
            imp.replace(".", "/") + "/index.js",
            imp.replace(".", "/") + "/index.ts",
            imp + ".go",
            imp,
        ]
        # Also try relative resolution
        source_dir = str(Path(source_file).parent)
        for c in candidates:
            if c in known_files:
                return c
            rel = f"{source_dir}/{c}".lstrip("/")
            if rel in known_files:
                return rel
        return None

    def to_json(self, repo_graph: RepoGraph) -> dict:
        return {
            "dep_graph": nx.node_link_data(repo_graph.dep_graph),
            "call_graph": nx.node_link_data(repo_graph.call_graph),
        }

    def from_json(self, data: dict) -> RepoGraph:
        return RepoGraph(
            dep_graph=nx.node_link_graph(data["dep_graph"], directed=True),
            call_graph=nx.node_link_graph(data["call_graph"], directed=True),
        )

    def save(self, repo_graph: RepoGraph, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_json(repo_graph)), encoding="utf-8")

    def load(self, path: Path) -> RepoGraph:
        data = json.loads(path.read_text(encoding="utf-8"))
        return self.from_json(data)

    def get_centrality_scores(self, G: nx.DiGraph) -> dict[str, float]:
        """Betweenness centrality — identifies single points of failure."""
        try:
            return nx.betweenness_centrality(G, normalized=True)
        except Exception:
            return {}

    def get_degree_scores(self, G: nx.DiGraph) -> dict[str, tuple[int, int]]:
        """Returns (in_degree, out_degree) per node — identifies tight coupling."""
        return {
            node: (G.in_degree(node), G.out_degree(node))
            for node in G.nodes()
        }


def get_graph_service() -> GraphService:
    return GraphService()
