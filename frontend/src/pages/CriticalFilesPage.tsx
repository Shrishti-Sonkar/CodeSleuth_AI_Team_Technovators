import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Zap, Network, FileSearch, Search, ArrowLeft,
  AlertTriangle, AlertCircle, Info, CheckCircle
} from 'lucide-react';
import { criticalFilesService } from '../services/criticalFilesService';
import { useSessionStore } from '../store/sessionStore';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Button, Spinner, ErrorState, EmptyState, SectionHeader } from '../components/shared/UI';
import type { CriticalFileItem, CriticalFilesResponse } from '../types/api';

// ── Where Used Modal (inline lightweight) ─────────────────────────────────────
import WhereUsedModal from '../components/shared/WhereUsedModal';

const RISK_CONFIG: Record<string, { icon: typeof AlertCircle; color: string; bg: string; label: string }> = {
  critical: { icon: AlertCircle, color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',      label: 'Critical' },
  high:     { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'High' },
  medium:   { icon: Info,          color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30',   label: 'Medium' },
  low:      { icon: CheckCircle,   color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/30',label: 'Low' },
};

function RiskBadge({ level }: { level: string }) {
  const cfg = RISK_CONFIG[level] ?? RISK_CONFIG['low'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, (score / 10) * 100);
  const color = score >= 8 ? '#ef4444' : score >= 6 ? '#f97316' : score >= 4 ? '#f59e0b' : '#34d399';
  return (
    <div className="h-1.5 rounded-full bg-[#080b14] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function CriticalCard({
  item, sessionId, onWhereUsed,
}: {
  item: CriticalFileItem;
  sessionId: string;
  onWhereUsed: (target: string) => void;
}) {
  const navigate = useNavigate();
  const { setHighlightedNodes } = useSessionStore();

  return (
    <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5 hover:border-white/10 transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-slate-200 text-sm font-semibold truncate" title={item.file_path}>
            {item.file_name}
          </p>
          <p className="font-mono text-slate-500 text-xs truncate">{item.file_path}</p>
        </div>
        <RiskBadge level={item.risk_level} />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">Criticality</span>
          <span className="font-semibold text-slate-300">{item.criticality_score.toFixed(1)}/10</span>
        </div>
        <ScoreBar score={item.criticality_score} />
      </div>

      {/* Reasons */}
      <div className="space-y-1.5">
        {item.reasons.slice(0, 3).map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <ShieldAlert className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
            {r}
          </div>
        ))}
      </div>

      {/* Risk categories */}
      {item.risk_categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.risk_categories.map((cat) => (
            <span key={cat} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-md font-mono">
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
        <button
          onClick={() => navigate(`/explain/${sessionId}?target=${encodeURIComponent(item.file_path)}`)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-colors"
        >
          <FileSearch className="w-3 h-3" /> Explain
        </button>
        <button
          onClick={() => navigate(`/impact/${sessionId}?target=${encodeURIComponent(item.file_path)}`)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          <Zap className="w-3 h-3" /> Analyze Impact
        </button>
        <button
          onClick={() => onWhereUsed(item.file_path)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <Search className="w-3 h-3" /> Where Used
        </button>
        <button
          onClick={() => {
            setHighlightedNodes([item.file_path]);
            navigate(`/graph/${sessionId}`);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
        >
          <Network className="w-3 h-3" /> Open in Graph
        </button>
      </div>
    </div>
  );
}

export default function CriticalFilesPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  useSessionGuard(sessionId);
  const navigate = useNavigate();

  const [data, setData] = useState<CriticalFilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [whereUsedTarget, setWhereUsedTarget] = useState<string | null>(null);

  const load = () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    criticalFilesService.get(sessionId, 10)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [sessionId]);

  return (
    <AppLayout>
      {/* Where Used modal */}
      {whereUsedTarget && sessionId && (
        <WhereUsedModal
          sessionId={sessionId}
          target={whereUsedTarget}
          onClose={() => setWhereUsedTarget(null)}
        />
      )}

      <div className="p-8 animate-fade-in">
        <button
          onClick={() => navigate(`/overview/${sessionId}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>

        <PageHeader
          title="Top Critical Files"
          subtitle="Files ranked by combined risk severity, centrality, and complexity"
        />

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner className="w-10 h-10" />
            <p className="text-slate-400 text-sm">Computing file criticality scores…</p>
          </div>
        )}
        {error && !loading && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && (!data || data.items.length === 0) && (
          <EmptyState
            icon={<ShieldAlert className="w-12 h-12" />}
            title="No critical files found"
            description="Ingest a larger repository for rankings to appear."
          />
        )}

        {data && data.items.length > 0 && !loading && (
          <div className="animate-fade-in">
            {/* Summary bar */}
            <div className="flex flex-wrap gap-4 mb-6">
              {(['critical', 'high', 'medium', 'low'] as const).map((lvl) => {
                const count = data.items.filter((i) => i.risk_level === lvl).length;
                const cfg = RISK_CONFIG[lvl];
                const Icon = cfg.icon;
                return count > 0 ? (
                  <div key={lvl} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                    {count} {cfg.label}
                  </div>
                ) : null;
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.items.map((item) => (
                <CriticalCard
                  key={item.file_path}
                  item={item}
                  sessionId={sessionId!}
                  onWhereUsed={setWhereUsedTarget}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
