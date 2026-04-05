import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function scoreColor(score: number): string {
  if (score >= 7) return 'text-red-400';
  if (score >= 4) return 'text-yellow-400';
  return 'text-emerald-400';
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'high':     return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'medium':   return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'low':      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    default:         return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
}

export function truncate(str: string, max = 60): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
