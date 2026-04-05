import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap, AlertTriangle, FileSearch, Network, GitFork,
  ChevronRight, Search, ArrowLeft, CheckCircle
} from 'lucide-react';
import { impactService } from '../services/impactService';
import { useSessionStore } from '../store/sessionStore';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Button, Spinner, ErrorState, EmptyState, SectionHeader } from '../components/shared/UI';
import type { ImpactResponse } from '../types/api';

const SCORE_COLOR = (s: number) =>
  s >= 8 ? 'text-red-400' : s >= 6 ? 'text-orange-400' : s >= 4 ? 'text-amber-400' : 'text-emerald-400';
const SCORE_BG = (s: number) =>
  s >= 8 ? 'bg-red-500/10 border-red-500/30' : s >= 6 ? 'bg-orange-500/10 border-orange-500/30'
    : s >= 4 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30';

export default function ImpactPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  useSessionGuard(sessionId);
  const navigate = useNavigate();
  const { setHighlightedNodes } = useSessionStore();

  const [target, setTarget] = useState('');
  const [targetType, setTargetType] = useState<'file' | 'module' | 'node'>('file');
  const [data, setData] = useState<ImpactResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('target');
    if (t) {
      setTarget(t);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!sessionId || !target.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await impactService.analyze(sessionId, target.trim(), targetType);
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHighlight = () => {
    if (data) {
      setHighlightedNodes(data.graph_highlights);
      navigate(`/graph/${sessionId}`);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <button
          onClick={() => navigate(`/overview/${sessionId}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>

        <PageHeader
          title="Change Impact Analyzer"
          subtitle="Discover which parts of the codebase are affected when this item changes"
        />

        {/* Input */}
        <div className="rounded-xl border border-white/5 bg-[#0d1424] p-6 mb-8">
          <SectionHeader title="Select Target" subtitle="Enter a file path, module name, or node ID" className="mb-4" />
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              {(['file', 'module', 'node'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTargetType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    targetType === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#131d2e] border border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              id="impact-target-input"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. src/auth/authService.py"
              className="flex-1 bg-[#080b14] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
            />
            <Button onClick={handleAnalyze} isLoading={loading} leftIcon={<Search className="w-4 h-4" />}>
              Analyze Impact
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner className="w-10 h-10" />
            <p className="text-slate-400 text-sm">Computing blast radius…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && <ErrorState message={error} onRetry={handleAnalyze} />}

        {/* Empty */}
        {!loading && !error && !data && (
          <EmptyState
            icon={<Zap className="w-12 h-12" />}
            title="No analysis yet"
            description="Enter a file path or module name above and click Analyze Impact."
          />
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Score + Summary */}
            <div className={`rounded-xl border p-6 ${SCORE_BG(data.impact_score)}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Impact Score</p>
                  <p className={`text-5xl font-black ${SCORE_COLOR(data.impact_score)}`}>
                    {data.impact_score.toFixed(1)}
                    <span className="text-2xl text-slate-500">/10</span>
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-mono text-indigo-300 text-sm mb-2 break-all">{data.target}</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{data.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-xs text-slate-500">
                      Confidence: {(data.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Network className="w-3.5 h-3.5" />}
                  onClick={handleHighlight}
                >
                  Highlight in Graph
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<FileSearch className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/explain/${sessionId}?target=${encodeURIComponent(data.target)}`)}
                >
                  Explain This File
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Affected Files */}
              <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#0d1424] p-5">
                <SectionHeader
                  title="Affected Files"
                  subtitle={`${data.affected_files.length} file(s) potentially impacted`}
                  className="mb-4"
                />
                {data.affected_files.length === 0 ? (
                  <p className="text-slate-500 text-sm">No downstream files found.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {data.affected_files.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#131d2e] border border-white/5 group hover:border-indigo-500/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setTarget(f.id);
                        }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-slate-200 text-xs truncate">{f.label}</p>
                          <p className="text-slate-500 text-xs">{f.reason}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side panel */}
              <div className="space-y-4">
                {/* Affected Modules */}
                <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                  <SectionHeader title="Affected Modules" className="mb-3" />
                  {data.affected_modules.length === 0
                    ? <p className="text-slate-500 text-sm">None identified.</p>
                    : (
                      <div className="flex flex-wrap gap-2">
                        {data.affected_modules.map((m) => (
                          <span key={m} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

                {/* Affected Flows */}
                <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                  <SectionHeader title="Affected Flows" className="mb-3" />
                  {data.affected_flows.length === 0
                    ? <p className="text-slate-500 text-sm">No specific flows detected.</p>
                    : (
                      <div className="space-y-2">
                        {data.affected_flows.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                            <GitFork className="w-3.5 h-3.5 text-violet-400" />
                            {f}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
