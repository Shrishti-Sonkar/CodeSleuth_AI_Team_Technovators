import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Code2, Cpu, ToggleLeft, ToggleRight, Layers, Zap, Search, Thermometer } from 'lucide-react';
import { graphService } from '../services/graphService';
import { adaptGraph } from '../services/adapters';
import { useGraphStore } from '../store/graphStore';
import { useSessionStore } from '../store/sessionStore';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Spinner, ErrorState, EmptyState, Button } from '../components/shared/UI';
import WhereUsedModal from '../components/shared/WhereUsedModal';
import { GRAPH_COLORS, HEAT_COLORS } from '../lib/constants';
import { formatNumber } from '../lib/utils';
import type { GraphNode as GNode, GraphEdge as GEdge, GraphType } from '../types/api';

// ── Converters ────────────────────────────────────────────────────────────────
function toRFNodes(nodes: GNode[], highlighted: string[], heatmap: boolean): Node[] {
  return nodes.map((n, i) => {
    const isHighlighted = highlighted.includes(n.id);
    let bg: string;
    if (isHighlighted) {
      bg = '#6366f1';
    } else if (heatmap && n.risk_level) {
      bg = HEAT_COLORS[n.risk_level] ?? GRAPH_COLORS[n.type] ?? '#6366f1';
    } else {
      bg = GRAPH_COLORS[n.type] ?? '#6366f1';
    }
    return {
      id: n.id,
      data: { label: n.label, node: n },
      position: {
        x: n.x ?? Math.cos((i / Math.max(nodes.length, 1)) * 2 * Math.PI) * 400 + 500,
        y: n.y ?? Math.sin((i / Math.max(nodes.length, 1)) * 2 * Math.PI) * 300 + 350,
      },
      style: {
        background: bg,
        color: '#fff',
        border: isHighlighted ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        boxShadow: isHighlighted ? '0 0 20px rgba(99,102,241,0.6)' : 'none',
        maxWidth: '180px',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    };
  });
}

function toRFEdges(edges: GEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? e.type,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    style: { stroke: '#6366f1', strokeWidth: 1.5, opacity: 0.7 },
    labelStyle: { fill: '#94a3b8', fontSize: 9 },
    labelBgStyle: { fill: '#080b14', fillOpacity: 0.8 },
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GraphExplorerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  useSessionGuard(sessionId);
  const navigate = useNavigate();

  const { highlightedNodes } = useSessionStore();
  const {
    data, graphType, selectedNodeId, isLoading, error,
    setData, setGraphType, setSelectedNode, setLoading, setError,
  } = useGraphStore();

  const [heatmap, setHeatmap] = useState(false);
  const [whereUsedTarget, setWhereUsedTarget] = useState<string | null>(null);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const fetchGraph = useCallback(async (type: GraphType) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await graphService.get(sessionId, type);
      const adapted = adaptGraph(raw);
      setData(adapted);
      setRfNodes(toRFNodes(adapted.nodes, highlightedNodes, heatmap));
      setRfEdges(toRFEdges(adapted.edges));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Graph load failed');
    } finally {
      setLoading(false);
    }
  }, [sessionId, highlightedNodes, heatmap, setData, setError, setLoading, setRfEdges, setRfNodes]);

  useEffect(() => { fetchGraph(graphType); }, [graphType]);

  // Re-colour when heatmap toggled (without re-fetching)
  useEffect(() => {
    if (data) {
      setRfNodes(toRFNodes(data.nodes, highlightedNodes, heatmap));
    }
  }, [heatmap, highlightedNodes]);

  const selectedNode = data?.nodes.find((n) => n.id === selectedNodeId);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  return (
    <AppLayout>
      {whereUsedTarget && sessionId && (
        <WhereUsedModal
          sessionId={sessionId}
          target={whereUsedTarget}
          onClose={() => setWhereUsedTarget(null)}
        />
      )}

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-0">
          <PageHeader
            title="Graph Explorer"
            subtitle={
              data
                ? `${data.stats['nodes'] ?? rfNodes.length} nodes · ${data.stats['edges'] ?? rfEdges.length} edges`
                : 'Loading graph…'
            }
            actions={
              <div className="flex items-center gap-2">
                {/* Heatmap toggle */}
                <Button
                  variant={heatmap ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setHeatmap((h) => !h)}
                >
                  <Thermometer className="w-4 h-4" />
                  {heatmap ? 'Heatmap ON' : 'Risk Heatmap'}
                </Button>
                {/* Graph type toggle */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setGraphType(graphType === 'dependency' ? 'call' : 'dependency')}
                >
                  {graphType === 'dependency'
                    ? <><ToggleLeft className="w-4 h-4" /> Dependency</>
                    : <><ToggleRight className="w-4 h-4" /> Call Graph</>
                  }
                </Button>
              </div>
            }
          />
        </div>

        {/* Legend */}
        <div className="px-6 mb-3 flex items-center gap-4 flex-wrap">
          {heatmap ? (
            <>
              {Object.entries(HEAT_COLORS).map(([level, color]) => (
                <div key={level} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                  <span className="text-xs capitalize text-slate-500">{level}</span>
                </div>
              ))}
              <span className="text-xs text-amber-400 ml-2">⚡ Risk Heatmap active</span>
            </>
          ) : (
            <>
              {Object.entries(GRAPH_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                  <span className="text-xs capitalize text-slate-500">{type}</span>
                </div>
              ))}
            </>
          )}
          {highlightedNodes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-indigo-500 shadow-lg shadow-indigo-500/40" />
              <span className="text-xs text-indigo-400">Highlighted by Q&amp;A</span>
            </div>
          )}
        </div>

        {/* Canvas area */}
        <div className="flex flex-1 overflow-hidden mx-6 mb-6 rounded-xl border border-white/5 relative" style={{ minHeight: 400 }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#080b14]/80 z-10 rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="w-8 h-8" />
                <span className="text-sm text-slate-400">Building graph…</span>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex-1 flex items-center justify-center p-8">
              <ErrorState message={error} onRetry={() => fetchGraph(graphType)} />
            </div>
          )}

          {!error && !isLoading && rfNodes.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState title="No graph data" description="The graph has no nodes to display." />
            </div>
          )}

          {!error && rfNodes.length > 0 && (
            <div style={{ width: '100%', height: '100%', flex: 1 }}>
              <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
                style={{ background: '#080b14', width: '100%', height: '100%' }}
              >
                <Background color="#1e2d45" gap={24} variant={BackgroundVariant.Dots} />
                <Controls />
                <MiniMap
                  nodeColor={(n) => (n.style?.background as string | undefined) ?? '#6366f1'}
                  maskColor="rgba(8,11,20,0.85)"
                />
              </ReactFlow>
            </div>
          )}

          {/* Side panel */}
          {selectedNode && (
            <div className="w-72 flex-shrink-0 border-l border-white/5 bg-[#0a0e1a] p-5 overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-200 text-sm">Node Details</h3>
                <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Label</p>
                  <p className="font-mono text-indigo-300 text-sm break-all">{selectedNode.label}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Path</p>
                  <p className="font-mono text-slate-400 text-xs break-all">{selectedNode.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#131d2e] rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <Code2 className="w-3 h-3" /> Lines
                    </p>
                    <p className="text-slate-200 font-bold">{formatNumber(selectedNode.lines)}</p>
                  </div>
                  <div className="bg-[#131d2e] rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Complexity
                    </p>
                    <p className="text-slate-200 font-bold">{selectedNode.complexity.toFixed(1)}</p>
                  </div>
                </div>
                <div className="bg-[#131d2e] rounded-lg p-3 space-y-1.5">
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="text-slate-200 text-sm capitalize">{selectedNode.type}</p>
                  <p className="text-xs text-slate-500 mt-1">Language</p>
                  <p className="text-slate-200 text-sm">{selectedNode.language}</p>
                </div>

                {/* Heatmap info */}
                {selectedNode.risk_level && selectedNode.risk_level !== 'safe' && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 space-y-1">
                    <p className="text-amber-300 text-xs font-semibold capitalize">
                      ⚡ Risk: {selectedNode.risk_level}
                    </p>
                    {selectedNode.criticality_score !== undefined && (
                      <p className="text-amber-400/70 text-xs">
                        Criticality: {selectedNode.criticality_score.toFixed(1)}/10
                      </p>
                    )}
                    {selectedNode.heat_score !== undefined && (
                      <p className="text-amber-400/70 text-xs">
                        Heat: {(selectedNode.heat_score * 100).toFixed(0)}%
                      </p>
                    )}
                    {(selectedNode.risk_categories ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedNode.risk_categories!.map((c) => (
                          <span key={c} className="px-1.5 py-0.5 bg-rose-500/10 text-rose-300 text-xs rounded border border-rose-500/20 font-mono">
                            {c.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedNode.highlighted && (
                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 text-indigo-300 text-xs">
                    ✦ Highlighted by AI query
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => navigate(`/explain/${sessionId}?target=${encodeURIComponent(selectedNode.id)}`)}
                  >
                    <Layers className="w-3.5 h-3.5" /> Explain This File
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => navigate(`/impact/${sessionId}?target=${encodeURIComponent(selectedNode.id)}`)}
                  >
                    <Zap className="w-3.5 h-3.5" /> Analyze Impact
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => setWhereUsedTarget(selectedNode.id)}
                  >
                    <Search className="w-3.5 h-3.5" /> Find Where Used
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
