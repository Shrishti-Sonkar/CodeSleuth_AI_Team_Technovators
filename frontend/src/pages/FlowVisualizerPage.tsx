import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Play, AlertTriangle, GitMerge, ArrowDown } from 'lucide-react';
import { flowService } from '../services/flowService';
import { adaptFlow } from '../services/adapters';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Spinner, EmptyState, ErrorState, Button } from '../components/shared/UI';
import { cn } from '../lib/utils';
import type { FlowResponse, FlowNode } from '../types/api';

const nodeTypeColors: Record<string, string> = {
  entrypoint: 'border-indigo-500 bg-indigo-500/10 text-indigo-300',
  function:   'border-cyan-500/40 bg-cyan-500/5 text-cyan-300',
  method:     'border-violet-500/40 bg-violet-500/5 text-violet-300',
  exit:       'border-slate-500/40 bg-slate-500/5 text-slate-400',
};

function FlowCard({ node, index, total }: { node: FlowNode; index: number; total: number }) {
  const colorClass = nodeTypeColors[node.node_type] ?? nodeTypeColors.function;
  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0', colorClass)}>
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="flex-1 w-0.5 bg-gradient-to-b from-indigo-500/30 to-transparent mt-1 min-h-6" />
        )}
      </div>
      {/* Card */}
      <div className={cn('flex-1 rounded-xl border p-4 mb-4 hover:border-indigo-500/40 transition-colors', colorClass.split(' ').filter(c => c.startsWith('border')).join(' '), 'bg-[#0d1424]')}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-200 text-sm">{node.label}</p>
            {node.function_name && (
              <p className="text-xs font-mono text-indigo-300 mt-0.5">{node.function_name}()</p>
            )}
          </div>
          <span className={cn('px-2 py-0.5 rounded text-[10px] font-semibold border capitalize flex-shrink-0', colorClass)}>
            {node.node_type}
          </span>
        </div>
        <p className="text-xs font-mono text-slate-500 mt-2">{node.file_path}
          {node.line_start != null && <span> · L{node.line_start}{node.line_end ? `–${node.line_end}` : ''}</span>}
        </p>
        {node.description && (
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{node.description}</p>
        )}
        <p className="text-xs text-slate-600 mt-1">Depth: {node.depth}</p>
      </div>
    </div>
  );
}

export default function FlowVisualizerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  useSessionGuard(sessionId);

  const [entryPoint, setEntryPoint] = useState(searchParams.get('entry') ?? '');
  const [inputVal, setInputVal]     = useState(searchParams.get('entry') ?? '');
  const [data, setData]             = useState<FlowResponse | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const fetchFlow = async () => {
    if (!sessionId || !entryPoint.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const raw = await flowService.get(sessionId, entryPoint.trim());
      setData(adaptFlow(raw));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (entryPoint) fetchFlow(); }, [entryPoint, sessionId]);

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <PageHeader
          title="Flow Visualizer"
          subtitle="Trace execution paths from any entry point"
        />

        {/* Entry point input */}
        <div className="glass rounded-xl p-5 mb-8 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Entry Point</label>
            <input
              type="text"
              placeholder="e.g. main, login, process_request"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setEntryPoint(inputVal)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#080b14] border border-white/10 text-slate-100 placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>
          <Button leftIcon={<Play className="w-4 h-4" />} onClick={() => setEntryPoint(inputVal)} isLoading={loading}>
            Trace Flow
          </Button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner className="w-10 h-10" />
            <p className="text-slate-400 text-sm">Tracing execution flow…</p>
          </div>
        )}

        {error && !loading && <ErrorState message={error} onRetry={fetchFlow} />}

        {!loading && !error && !data && (
          <EmptyState
            icon={<GitMerge />}
            title="Enter an entry point"
            description="Type a function name or file path above to trace its execution flow."
          />
        )}

        {!loading && data && (
          <div className="space-y-0">
            {/* Meta */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: 'Entry', value: data.entry_point },
                { label: 'Steps', value: data.total_steps },
                { label: 'Max Depth', value: data.max_depth },
                { label: 'Has Cycles', value: data.has_cycles ? '⚠ Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1424] border border-white/5">
                  <span className="text-xs text-slate-500">{label}:</span>
                  <span className="text-xs font-semibold text-slate-200">{String(value)}</span>
                </div>
              ))}
              {data.has_cycles && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-300">Cycles: {data.cycle_nodes.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Flow steps */}
            <div className="max-w-2xl">
              {data.nodes
                .sort((a, b) => a.depth - b.depth)
                .map((node, i, arr) => (
                  <FlowCard key={node.id} node={node} index={i} total={arr.length} />
                ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
