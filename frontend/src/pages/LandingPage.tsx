import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, GitBranch, KeyRound, ArrowRight, Sparkles, Network, ShieldAlert, MessageSquare, FolderGit2 } from 'lucide-react';
import { ingestService } from '../services/ingestService';
import { useSessionStore } from '../store/sessionStore';
import { Button, Spinner } from '../components/shared/UI';
import { cn } from '../lib/utils';

const FEATURES = [
  { icon: Network,       label: 'Dependency Graph',    desc: 'Visual module relationship explorer' },
  { icon: Zap,           label: 'Execution Flows',     desc: 'Call tree tracing from entry points' },
  { icon: ShieldAlert,   label: 'Risk Intelligence',   desc: 'Auto-detect secrets, complexity, coupling' },
  { icon: MessageSquare, label: 'AI Q&A',              desc: 'Natural language questions about any code' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { setSession } = useSessionStore();

  const [repoUrl, setRepoUrl]   = useState('');
  const [branch, setBranch]     = useState('');
  const [token, setToken]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) { setError('Please enter a GitHub repository URL.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await ingestService.start({
        repo_url: repoUrl.trim(),
        branch: branch.trim() || undefined,
        token: token.trim() || undefined,
      });
      setSession(res.session_id, repoUrl.trim(), branch.trim() || 'main');
      navigate(`/ingest/${res.session_id}`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to start ingestion. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[80px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-100 text-sm tracking-tight">CodeSleuth AI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 border border-white/10 rounded-full px-3 py-1">v1.0 · Multi-Agent</span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-8">
        <div className="animate-fade-in flex flex-col items-center text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Multi-Agent Code Intelligence Platform
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="text-slate-100">Understand any</span>
            <br />
            <span className="gradient-text">GitHub codebase</span>
            <br />
            <span className="text-slate-100">in minutes</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mb-12 leading-relaxed">
            Paste a repository URL. CodeSleuth's AI agents analyze dependencies, trace execution flows,
            detect risks, and answer questions in plain English.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl glass rounded-2xl p-6 glow-border space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" /> Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080b14] border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" /> Branch <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#080b14] border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> GitHub Token <span className="text-slate-600">(private repos)</span>
                </label>
                <input
                  type="password"
                  placeholder="ghp_••••••••"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#080b14] border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="w-full justify-center"
            >
              {!loading && <ArrowRight className="w-4 h-4" />}
              {loading ? 'Starting analysis…' : 'Analyze Repository'}
            </Button>
          </form>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-4xl w-full px-4">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-white/5 bg-[#0d1424]/80 p-4 flex flex-col gap-2 hover:border-indigo-500/30 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-slate-200 text-sm font-semibold">{label}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="relative z-10 text-center py-6 text-xs text-slate-600">
        CodeSleuth AI · Built for code intelligence
      </footer>
    </div>
  );
}
