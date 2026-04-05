import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useIngestPolling } from '../hooks/useIngestPolling';
import { useSessionStore } from '../store/sessionStore';
import { STATUS_LABELS } from '../lib/constants';
import { Button } from '../components/shared/UI';
import { cn } from '../lib/utils';

const PHASES = [
  'queued', 'cloning', 'parsing', 'indexing', 'building_graph', 'detecting_risks', 'ready',
] as const;

function PhaseStep({ phase, current }: { phase: string; current: string }) {
  const phases = PHASES as readonly string[];
  const currentIdx = phases.indexOf(current);
  const phaseIdx   = phases.indexOf(phase);
  const done    = phaseIdx < currentIdx;
  const active  = phaseIdx === currentIdx;

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
        done   && 'bg-emerald-500 border-emerald-500 text-white',
        active && 'bg-indigo-600 border-indigo-400 text-white animate-pulse-glow',
        !done && !active && 'bg-transparent border-slate-700 text-slate-600'
      )}>
        {done ? '✓' : phaseIdx + 1}
      </div>
      <span className={cn(
        'text-sm font-medium transition-colors',
        done   && 'text-emerald-400',
        active && 'text-indigo-300',
        !done && !active && 'text-slate-600'
      )}>
        {STATUS_LABELS[phase] ?? phase}
      </span>
    </div>
  );
}

export default function IngestProgressPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { status, progress, repoName, error, repoUrl, branch } = useSessionStore();

  useIngestPolling(sessionId);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass rounded-2xl p-8 text-center space-y-5 glow-border border-red-500/20">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Ingestion Failed</h2>
          <p className="text-slate-400 text-sm">{error ?? 'An unknown error occurred during repository ingestion.'}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Home</Button>
            </Link>
            <Button leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-6">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      <div className="relative max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Analyzing Repository
          </div>
          {repoName ? (
            <h1 className="text-2xl font-bold text-slate-100">{repoName}</h1>
          ) : (
            <h1 className="text-2xl font-bold text-slate-400 font-mono text-sm">{repoUrl}</h1>
          )}
          <p className="text-slate-500 text-sm mt-1">Branch: <span className="text-slate-400">{branch}</span></p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 glow-border space-y-8">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{STATUS_LABELS[status ?? 'queued'] ?? 'Processing…'}</span>
              <span className="font-mono font-bold text-indigo-400">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#0d1424] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Phase stepper */}
          <div className="space-y-3">
            {PHASES.filter(p => p !== 'ready').map((phase) => (
              <PhaseStep key={phase} phase={phase} current={status ?? 'queued'} />
            ))}
          </div>

          {/* Language breakdown */}
          {status !== 'queued' && status !== 'cloning' && (
            <div className="bg-[#080b14] rounded-xl p-4 space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Session</p>
              <p className="font-mono text-xs text-indigo-300 break-all">{sessionId}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          This may take 30–120 seconds depending on repository size
        </p>
      </div>
    </div>
  );
}
