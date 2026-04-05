import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, MapPin, Layers, MessageSquare, List, HelpCircle,
  GraduationCap, ChevronRight, Network, ShieldAlert, ArrowLeft,
  FileText, CheckCircle2
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Button, Spinner, ErrorState, EmptyState, SectionHeader } from '../components/shared/UI';
import type { OnboardingResponse } from '../types/api';

export default function OnboardingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  useSessionGuard(sessionId);
  const navigate = useNavigate();

  const [data, setData] = useState<OnboardingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    onboardingService.get(sessionId)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [sessionId]);

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <button
          onClick={() => navigate(`/overview/${sessionId}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>

        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-7 h-7 text-emerald-400" />
          <PageHeader
            title="New Developer Onboarding"
            subtitle={data ? `Welcome to ${data.repo_name}` : 'Generating your personalised guide…'}
          />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner className="w-10 h-10" />
            <p className="text-slate-400 text-sm">Building your onboarding guide…</p>
          </div>
        )}
        {error && !loading && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && !data && (
          <EmptyState icon={<GraduationCap className="w-12 h-12" />} title="No onboarding data" />
        )}

        {data && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Overview + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">Repository Overview</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{data.overview}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</p>
                <Link to={`/graph/${sessionId}`}>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#131d2e] border border-indigo-500/20 hover:border-indigo-500/50 text-sm text-slate-300 hover:text-indigo-300 transition-all group mb-2">
                    <Network className="w-4 h-4 text-indigo-400" />
                    Open Graph Explorer
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-indigo-400" />
                  </button>
                </Link>
                <Link to={`/critical-files/${sessionId}`}>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#131d2e] border border-rose-500/20 hover:border-rose-500/50 text-sm text-slate-300 hover:text-rose-300 transition-all group mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    See Critical Files
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-rose-400" />
                  </button>
                </Link>
                <Link to={`/query/${sessionId}`}>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#131d2e] border border-emerald-500/20 hover:border-emerald-500/50 text-sm text-slate-300 hover:text-emerald-300 transition-all group">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Ask Repo Anything
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-emerald-400" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Recommended Start Points */}
            <div>
              <SectionHeader title="Where to Start" subtitle="Best files for a new developer" className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recommended_start_points.map((sp, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-[#0d1424] p-5 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-300 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-slate-200 text-sm font-semibold">{sp.title}</p>
                    </div>
                    <p className="font-mono text-indigo-400 text-xs mb-2 truncate">{sp.file}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{sp.reason}</p>
                    <button
                      onClick={() => navigate(`/explain/${sessionId}?target=${encodeURIComponent(sp.file)}`)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <FileText className="w-3 h-3" /> Explain this file
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Modules + Learning Path */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                <SectionHeader title="Key Modules" subtitle="Core areas of the codebase" className="mb-4" />
                <div className="space-y-3">
                  {data.key_modules.map((mod) => (
                    <div key={mod.name} className="flex gap-3 p-3 bg-[#131d2e] rounded-lg border border-white/5">
                      <Layers className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-200 text-sm font-semibold font-mono">{mod.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{mod.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                <SectionHeader title="Learning Path" subtitle="Recommended order to explore" className="mb-4" />
                <div className="space-y-2">
                  {data.learning_path.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Questions + Glossary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                <SectionHeader title="Suggested Questions" subtitle="Ask these in the Q&A panel" className="mb-4" />
                <div className="space-y-2">
                  {data.suggested_questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/query/${sessionId}?q=${encodeURIComponent(q)}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 bg-[#131d2e] rounded-lg border border-white/5 hover:border-emerald-500/30 text-left text-slate-300 text-sm hover:text-emerald-300 transition-all group"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {q}
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-emerald-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0d1424] p-5">
                <SectionHeader title="Glossary" subtitle="Key terms explained simply" className="mb-4" />
                <div className="space-y-3">
                  {data.glossary.map((g) => (
                    <div key={g.term} className="border-l-2 border-indigo-500/30 pl-3">
                      <p className="text-indigo-300 text-sm font-semibold">{g.term}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{g.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
