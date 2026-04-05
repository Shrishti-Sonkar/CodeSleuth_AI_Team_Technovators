import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FileSearch, Code2, ArrowRight, ArrowLeft, Cpu, Layers } from 'lucide-react';
import { explainService } from '../services/explainService';
import { adaptExplain } from '../services/adapters';
import { useSessionStore } from '../store/sessionStore';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { ModeChip } from '../components/shared/Badges';
import { Spinner, ErrorState, EmptyState, Button } from '../components/shared/UI';
import { formatNumber, scoreColor } from '../lib/utils';
import type { ExplainResponse, ExplanationMode } from '../types/api';

export default function ExplainDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  useSessionGuard(sessionId);

  const { explanationMode, setExplanationMode } = useSessionStore();

  const [target, setTarget]   = useState(searchParams.get('target') ?? '');
  const [inputVal, setInputVal] = useState(searchParams.get('target') ?? '');
  const [data, setData]       = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchExplain = async (tgt: string, mode: ExplanationMode) => {
    if (!sessionId || !tgt.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const raw = await explainService.get(sessionId, tgt.trim(), mode);
      setData(adaptExplain(raw));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (target) fetchExplain(target, explanationMode);
  }, [target, explanationMode, sessionId]);

  const handleMode = (m: ExplanationMode) => {
    setExplanationMode(m);
    if (target) fetchExplain(target, m);
  };

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <PageHeader
          title="Explain"
          subtitle="AI-powered code explanations at any level of detail"
        />

        {/* Controls */}
        <div className="glass rounded-xl p-5 mb-8 space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">File / Module path</label>
              <input
                type="text"
                placeholder="e.g. src/auth.py or src/auth.py::login"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setTarget(inputVal)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#080b14] border border-white/10 text-slate-100 placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
            <Button
              isLoading={loading}
              leftIcon={<FileSearch className="w-4 h-4" />}
              onClick={() => setTarget(inputVal)}
            >
              Explain
            </Button>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Detail level:</span>
            {(['intern', 'engineer', 'architect'] as ExplanationMode[]).map((m) => (
              <ModeChip key={m} mode={m} active={explanationMode === m} onClick={() => handleMode(m)} />
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner className="w-10 h-10" />
            <p className="text-slate-400 text-sm">Generating explanation…</p>
          </div>
        )}

        {error && !loading && <ErrorState message={error} onRetry={() => fetchExplain(target, explanationMode)} />}

        {!loading && !error && !data && (
          <EmptyState
            icon={<FileSearch />}
            title="Enter a file path"
            description="Provide a file path or file::function to get a detailed explanation."
          />
        )}

        {!loading && data && (
          <div className="space-y-6 animate-fade-in">
            {/* Header card */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-indigo-300 text-sm">{data.target}</p>
                  <h2 className="text-xl font-bold text-slate-100 mt-1">{data.title}</h2>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">{data.summary}</p>
                </div>
                <ModeChip mode={data.mode} />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5">
                <div className="bg-[#080b14] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Code2 className="w-3 h-3" /> Lines</p>
                  <p className="font-bold text-slate-200">{formatNumber(data.line_count)}</p>
                </div>
                <div className="bg-[#080b14] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> Complexity</p>
                  <p className={`font-bold ${scoreColor(data.complexity_score)}`}>{data.complexity_score.toFixed(1)}/10</p>
                </div>
                <div className="bg-[#080b14] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Language</p>
                  <p className="font-bold text-slate-200">{data.language}</p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-xl border border-white/5 bg-[#0d1424] p-6">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Explanation
              </h3>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{data.explanation}</div>
            </div>

            {/* Key concepts */}
            {data.key_concepts.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-[#0d1424] p-6">
                <h3 className="font-semibold text-slate-200 mb-4">Key Concepts</h3>
                <ul className="space-y-2">
                  {data.key_concepts.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-indigo-400 font-bold mt-0.5">·</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deps / dependents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.dependencies.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                  <h3 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> Imports
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.dependencies.map((d) => (
                      <button
                        key={d}
                        onClick={() => { setInputVal(d); setTarget(d); }}
                        className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono hover:border-cyan-500/50 transition-colors"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {data.dependents.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                  <h3 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
                    <ArrowLeft className="w-3.5 h-3.5 text-violet-400" /> Imported by
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.dependents.map((d) => (
                      <button
                        key={d}
                        onClick={() => { setInputVal(d); setTarget(d); }}
                        className="px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono hover:border-violet-500/50 transition-colors"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
