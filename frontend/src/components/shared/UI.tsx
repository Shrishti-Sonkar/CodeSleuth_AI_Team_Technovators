import React from 'react';
import { cn } from '../../lib/utils';

// ── Section Header ──────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}
export function SectionHeader({ title, subtitle, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h2 className="text-xl font-bold text-slate-100">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ── Loading Skeleton ────────────────────────────────────────────────────────
interface SkeletonProps { className?: string; count?: number; }
export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4 rounded w-full', className)} />
      ))}
    </>
  );
}
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-white/5 bg-[#0d1424] p-5 space-y-3', className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      {icon && <div className="text-slate-600 text-5xl">{icon}</div>}
      <div>
        <p className="text-slate-300 font-semibold text-lg">{title}</p>
        {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── Error State ─────────────────────────────────────────────────────────────
interface ErrorStateProps { message: string; onRetry?: () => void; }
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3">
      <p className="text-red-400 font-semibold">Something went wrong</p>
      <p className="text-red-300/70 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-400',
        'animate-spin',
        className
      )}
    />
  );
}

// ── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}
export function Button({
  variant = 'primary', size = 'md', isLoading, leftIcon,
  children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
    secondary: 'bg-[#131d2e] border border-indigo-500/30 text-indigo-300 hover:border-indigo-500/60 hover:bg-[#1c2a42]',
    ghost:     'text-slate-400 hover:text-slate-200 hover:bg-white/5',
    danger:    'bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30',
  };
  const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-6 py-3' };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner className="w-4 h-4" /> : leftIcon}
      {children}
    </button>
  );
}
