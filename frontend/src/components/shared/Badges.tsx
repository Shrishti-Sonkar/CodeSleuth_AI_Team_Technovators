import React from 'react';
import { cn, severityColor } from '../../lib/utils';
import type { RiskSeverity } from '../../types/api';

interface BadgeProps {
  label: string;
  severity?: RiskSeverity;
  className?: string;
}

export function SeverityBadge({ label, severity, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border',
        severity ? severityColor(severity) : 'bg-slate-700/40 text-slate-300 border-slate-600/40',
        className
      )}
    >
      {label}
    </span>
  );
}

interface ModeChipProps {
  mode: 'intern' | 'engineer' | 'architect';
  active?: boolean;
  onClick?: () => void;
}

const modeStyles = {
  intern:   'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  engineer: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
  architect:'border-violet-500/40 text-violet-400 bg-violet-500/10',
};
const modeActiveStyles = {
  intern:   'border-emerald-500 bg-emerald-500/20',
  engineer: 'border-indigo-500 bg-indigo-500/20',
  architect:'border-violet-500 bg-violet-500/20',
};

export function ModeChip({ mode, active, onClick }: ModeChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all duration-150',
        modeStyles[mode],
        active && modeActiveStyles[mode],
        onClick && 'cursor-pointer hover:opacity-90',
        !onClick && 'cursor-default'
      )}
    >
      {mode}
    </button>
  );
}

interface SourcePillProps { file: string; onClick?: () => void; }
export function SourcePill({ file, onClick }: SourcePillProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131d2e] border border-indigo-500/20 text-indigo-300 text-xs font-mono hover:border-indigo-500/50 transition-colors"
    >
      <span className="truncate max-w-[200px]">{file}</span>
    </button>
  );
}
