import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Files, Code2, GitFork, Calendar, Cpu, ShieldAlert,
  Network, Workflow, MessageSquare, FileSearch, ArrowRight,
  BookOpen, Layers, Globe, Zap, GraduationCap, Flame
} from 'lucide-react';
import { overviewService } from '../services/overviewService';
import { adaptOverview } from '../services/adapters';
import { useSessionStore } from '../store/sessionStore';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { StatCard } from '../components/shared/StatCard';
import { SectionHeader, SkeletonCard, ErrorState } from '../components/shared/UI';
import { formatNumber, formatDate } from '../lib/utils';
import type { OverviewResponse } from '../types/api';

const NAV_CARDS = [
  { label: 'Graph Explorer',    icon: Network,       path: 'graph',   desc: 'Dependency & call graphs',    color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  { label: 'Flow Visualizer',   icon: Workflow,       path: 'flow',    desc: 'Execution flow tracing',      color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { label: 'Risk Intelligence', icon: ShieldAlert,    path: 'risk',    desc: 'Security & quality risks',    color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
  { label: 'Ask Repo',          icon: MessageSquare,  path: 'query',   desc: 'Natural language Q&A',        color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Explain Code',      icon: FileSearch,     path: 'explain', desc: 'Module-level explanations',   color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { label: 'Impact Analyzer',   icon: Zap,            path: 'impact',  desc: 'Blast radius analysis',       color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: 'Onboarding',        icon: GraduationCap,  path: 'onboarding', desc: 'Developer starting points',color: 'text-teal-400',   bg: 'bg-teal-500/10 border-teal-500/20' },
  { label: 'Critical Files',    icon: Flame,          path: 'critical-files', desc: 'Top risky components', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
];

export default function OverviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  useSessionGuard(sessionId);

  const { setOverview } = useSessionStore();
  const [data, setData]     = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    overviewService.get(sessionId)
      .then((raw) => {
        const adapted = adaptOverview(raw);
        setData(adapted);
        setOverview(adapted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <PageHeader
          title={data?.repo_name ?? 'Repository Overview'}
          subtitle={data ? `${data.repo_url} · ${data.branch}` : 'Loading…'}
        />

        {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : data ? (
            <>
              <StatCard label="Total Files"     value={formatNumber(data.total_files)}     icon={<Files className="w-5 h-5" />}     accent="default" />
              <StatCard label="Lines of Code"   value={formatNumber(data.total_lines)}     icon={<Code2 className="w-5 h-5" />}     accent="cyan" />
              <StatCard label="Functions"       value={formatNumber(data.total_functions)} icon={<Cpu className="w-5 h-5" />}       accent="violet" />
              <StatCard label="Classes"         value={formatNumber(data.total_classes)}   icon={<Layers className="w-5 h-5" />}    accent="emerald" />
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : data ? (
            <>
              <StatCard label="Contributors"  value={formatNumber(data.contributors)}                        icon={<GitFork className="w-5 h-5" />}  accent="amber" />
              <StatCard label="Last Commit"   value={formatDate(data.last_commit)}                           icon={<Calendar className="w-5 h-5" />} />
              <StatCard label="Complexity"    value={`${data.complexity_score.toFixed(1)}/10`}               icon={<Cpu className="w-5 h-5" />}       accent={data.complexity_score >= 7 ? 'rose' : data.complexity_score >= 4 ? 'amber' : 'emerald'} />
              <StatCard label="Risk Score"    value={`${data.risk_score.toFixed(1)}/10`}                     icon={<ShieldAlert className="w-5 h-5" />} accent={data.risk_score >= 7 ? 'rose' : data.risk_score >= 4 ? 'amber' : 'emerald'} />
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Languages */}
          <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5 col-span-1">
            <SectionHeader title="Languages" subtitle="By percentage" className="mb-4" />
            {loading ? (
              <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-5 rounded" />)}</div>
            ) : data ? (
              <div className="space-y-3">
                {Object.entries(data.languages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([lang, pct]) => (
                    <div key={lang}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{lang}</span>
                        <span className="text-slate-500">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#080b14]">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>

          {/* Top modules */}
          <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5 col-span-1">
            <SectionHeader title="Top Modules" subtitle="Key directories & files" className="mb-4" />
            {loading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-8 rounded-lg" />)}</div>
            ) : data ? (
              <div className="flex flex-wrap gap-2">
                {data.top_modules.map((mod) => (
                  <span key={mod} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                    {mod}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* README / Entry points */}
          <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5 col-span-1 space-y-5">
            {data?.readme_summary && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-300">README</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-5">{data.readme_summary}</p>
              </div>
            )}
            {(data?.entry_points ?? []).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-300">Entry Points</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(data?.entry_points ?? []).map((ep) => (
                    <span key={ep} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono rounded-md">{ep}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation cards */}
        <SectionHeader title="Explore" subtitle="Dive deeper into the codebase" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {NAV_CARDS.map(({ label, icon: Icon, path, desc, color, bg }) => (
            <Link
              key={path}
              to={`/${path}/${sessionId}`}
              className={`rounded-xl border ${bg} p-4 flex flex-col gap-3 hover:scale-[1.02] transition-all duration-200`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <p className="text-slate-200 text-sm font-semibold">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
              <ArrowRight className={`w-4 h-4 ${color} mt-auto`} />
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
