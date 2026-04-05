import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Network, GitBranch, AlertCircle, Loader2 } from 'lucide-react';
import { whereUsedService } from '../../services/whereUsedService';
import { useSessionStore } from '../../store/sessionStore';
import type { WhereUsedResponse } from '../../types/api';

interface Props {
  sessionId: string;
  target: string;
  onClose: () => void;
}

const RELATION_COLORS: Record<string, string> = {
  imports: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  calls:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  uses:    'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

export default function WhereUsedModal({ sessionId, target, onClose }: Props) {
  const navigate = useNavigate();
  const { setHighlightedNodes } = useSessionStore();
  const [data, setData] = useState<WhereUsedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    whereUsedService.find(sessionId, target, 'file')
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [sessionId, target]);

  const handleHighlight = () => {
    if (data) {
      setHighlightedNodes(data.graph_highlights);
      onClose();
      navigate(`/graph/${sessionId}`);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0d1424] border border-white/10 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-slate-200 font-semibold text-sm">Where Is This Used?</h2>
            <p className="font-mono text-indigo-400 text-xs mt-0.5 truncate max-w-xs">{target}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Searching for usages…</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {data && !loading && (
            <div className="space-y-5">
              {/* Summary */}
              <p className="text-slate-300 text-sm leading-relaxed">{data.summary}</p>

              {/* Used By list */}
              {data.used_by.length > 0 ? (
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                    Used by {data.used_by.length} file(s)
                  </p>
                  <div className="space-y-2">
                    {data.used_by.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-3 bg-[#131d2e] rounded-lg border border-white/5">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-slate-200 text-xs truncate">{u.label}</p>
                          <p className="font-mono text-slate-500 text-xs truncate">{u.id}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${RELATION_COLORS[u.relation] ?? 'text-slate-400 bg-white/5 border-white/10'}`}>
                          {u.relation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-6">
                  No other files reference this target in the analysed graph.
                </p>
              )}

              {/* Related flows */}
              {data.related_flows.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Related Flows</p>
                  <div className="flex flex-wrap gap-2">
                    {data.related_flows.map((f) => (
                      <span key={f} className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-lg">
                        <GitBranch className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {data && !loading && (
          <div className="px-6 py-4 border-t border-white/5 flex gap-3">
            <button
              onClick={handleHighlight}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Network className="w-4 h-4" /> Highlight in Graph
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#131d2e] border border-white/10 text-slate-400 hover:text-slate-200 text-sm rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
