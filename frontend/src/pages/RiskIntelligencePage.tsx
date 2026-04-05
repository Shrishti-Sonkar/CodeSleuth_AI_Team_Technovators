import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldAlert, FileCode, Lightbulb, Filter } from 'lucide-react';
import { riskService } from '../services/riskService';
import { adaptRisk } from '../services/adapters';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { SectionHeader, SkeletonCard, ErrorState, EmptyState } from '../components/shared/UI';
import { SeverityBadge } from '../components/shared/Badges';
import { StatCard } from '../components/shared/StatCard';
import { RISK_CATEGORY_LABELS, SEVERITY_ORDER } from '../lib/constants';
import { cn } from '../lib/utils';
import type { RiskResponse, RiskSeverity, RiskItem } from '../types/api';

const severityIcons: Record<RiskSeverity, string> = {
  critical: '🔴', high: '🟠', medium: '🟡', low: '🔵',
};

function RiskCard({ item }: { item: RiskItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn(
        'rounded-xl border bg-[#0d1424] p-5 transition-all duration-200 cursor-pointer',
        item.severity === 'critical' ? 'border-red-500/30 hover:border-red-500/60' :
        item.severity === 'high'     ? 'border-orange-500/30 hover:border-orange-500/60' :
        item.severity === 'medium'   ? 'border-yellow-500/30 hover:border-yellow-500/60' :
                                       'border-blue-500/30 hover:border-blue-500/60'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge label={item.severity.toUpperCase()} severity={item.severity} />
            <span className="text-xs text-slate-500 bg-[#131d2e] px-2 py-0.5 rounded border border-white/5">
              {RISK_CATEGORY_LABELS[item.category] ?? item.category}
            </span>
          </div>
          <p className="font-semibold text-slate-200 text-sm">{item.title}</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
        </div>
        <span className="text-lg flex-shrink-0">{severityIcons[item.severity]}</span>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 animate-fade-in">
          {/* Affected files */}
          {item.affected_files.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" /> Affected Files
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.affected_files.map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded bg-[#131d2e] border border-white/5 text-slate-300 text-xs font-mono">{f}</span>
                ))}
              </div>
            </div>
          )}
          {/* Line numbers */}
          {item.line_numbers && item.line_numbers.length > 0 && (
            <p className="text-xs text-slate-500">Lines: <span className="text-slate-300 font-mono">{item.line_numbers.join(', ')}</span></p>
          )}
          {/* Suggestion */}
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3.5 h-3.5" /> Suggestion
            </p>
            <p className="text-xs text-emerald-300/80 leading-relaxed">{item.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RiskIntelligencePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  useSessionGuard(sessionId);

  const [data, setData]           = useState<RiskResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filterSev, setFilterSev] = useState<RiskSeverity | 'all'>('all');

  useEffect(() => {
    if (!sessionId) return;
    riskService.get(sessionId)
      .then((raw) => setData(adaptRisk(raw)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const filtered = data?.items.filter(
    (i) => filterSev === 'all' || i.severity === filterSev
  ).sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)) ?? [];

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <PageHeader
          title="Risk Intelligence"
          subtitle="Automated security and quality analysis"
        />

        {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

        {/* Summary stats */}
        {!loading && data && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Risk Score"  value={`${data.risk_score.toFixed(1)}/10`} accent={data.risk_score >= 7 ? 'rose' : data.risk_score >= 4 ? 'amber' : 'emerald'} icon={<ShieldAlert className="w-5 h-5" />} className="col-span-2" />
            <StatCard label="Critical"    value={data.summary.critical} accent="rose" className="col-span-1" />
            <StatCard label="High"        value={data.summary.high}     accent="amber" className="col-span-1" />
            <StatCard label="Medium"      value={data.summary.medium}   accent="default" className="col-span-1" />
            <StatCard label="Low"         value={data.summary.low}      accent="cyan" className="col-span-1" />
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Filter bar */}
        {data && (
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-slate-500" />
            {(['all', ...SEVERITY_ORDER] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSev(s as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all',
                  filterSev === s
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-[#0d1424] border-white/5 text-slate-400 hover:text-slate-200'
                )}
              >
                {s === 'all' ? `All (${data.total_risks})` : s}
              </button>
            ))}
          </div>
        )}

        {/* Risk cards */}
        {!loading && filtered.length === 0 && !error && (
          <EmptyState icon={<ShieldAlert />} title="No risks found" description="Either the codebase is clean or analysis is still running." />
        )}

        <div className="space-y-3">
          {filtered.map((item) => <RiskCard key={item.id} item={item} />)}
        </div>
      </div>
    </AppLayout>
  );
}
