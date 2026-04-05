import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  GitBranch, LayoutDashboard, Network, Workflow,
  ShieldAlert, MessageSquare, FileSearch, ChevronRight,
  Zap, Home, GraduationCap, Flame, Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSessionStore } from '../../store/sessionStore';

const navItems = [
  { label: 'Overview',       icon: LayoutDashboard, path: 'overview' },
  { label: 'Graph',          icon: Network,          path: 'graph' },
  { label: 'Flow',           icon: Workflow,          path: 'flow' },
  { label: 'Risks',          icon: ShieldAlert,       path: 'risk' },
  { label: 'Ask Repo',       icon: MessageSquare,     path: 'query' },
  { label: 'Explain',        icon: FileSearch,        path: 'explain' },
  { label: 'Impact',         icon: Zap,               path: 'impact' },
  { label: 'Onboarding',     icon: GraduationCap,     path: 'onboarding' },
  { label: 'Critical Files', icon: Flame,             path: 'critical-files' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sessionId } = useParams();
  const location = useLocation();
  const { repoName, status } = useSessionStore();

  return (
    <div className="flex h-screen bg-[#080b14] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0a0e1a]">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-100 text-sm tracking-tight">CodeSleuth AI</span>
          </Link>
        </div>

        {/* Repo info */}
        {repoName && (
          <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-[#131d2e] border border-indigo-500/20">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <p className="text-xs text-indigo-300 font-medium truncate">{repoName}</p>
            </div>
            {status === 'ready' && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready
              </span>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, path }) => {
            const href = sessionId ? `/${path}/${sessionId}` : '/';
            const active = location.pathname.startsWith(`/${path}/`);
            return (
              <Link
                key={path}
                to={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')} />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Link to="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <Home className="w-3.5 h-3.5" />
            New Analysis
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// Minimal header used inside page content areas
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
