import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Network, Bot, User, ExternalLink, ChevronDown } from 'lucide-react';
import { queryService } from '../services/queryService';
import { adaptQuery } from '../services/adapters';
import { useQueryStore } from '../store/queryStore';
import { useSessionStore } from '../store/sessionStore';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { ModeChip, SourcePill } from '../components/shared/Badges';
import { Spinner, EmptyState, Button } from '../components/shared/UI';
import { EXPLANATION_MODE_DESCRIPTIONS } from '../lib/constants';
import { cn, uid } from '../lib/utils';
import type { ExplanationMode, ChatMessage } from '../types/domain';

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
        isUser ? 'bg-indigo-600' : 'bg-violet-600/50 border border-violet-500/30'
      )}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-violet-300" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%] space-y-3', isUser ? 'items-end flex flex-col' : '')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-[#131d2e] border border-white/5 text-slate-200 rounded-tl-sm'
        )}>
          {msg.content}
        </div>

        {/* AI extras */}
        {!isUser && (
          <>
            {/* Confidence + mode */}
            {msg.confidence !== undefined && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-slate-500">Confidence:</span>
                <span className="text-xs font-semibold text-emerald-400">{Math.round(msg.confidence * 100)}%</span>
                {msg.mode && <ModeChip mode={msg.mode as ExplanationMode} />}
              </div>
            )}

            {/* Sources */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-1">
                <span className="text-xs text-slate-600 w-full mb-0.5">Sources:</span>
                {msg.sources.map((s) => (
                  <SourcePill key={s.file_path} file={s.file_path} />
                ))}
              </div>
            )}

            {/* Highlighted nodes */}
            {msg.highlightedNodes && msg.highlightedNodes.length > 0 && (
              <div className="px-1">
                <p className="text-xs text-indigo-400">{msg.highlightedNodes.length} nodes highlighted in graph</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AskRepoPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  useSessionGuard(sessionId);
  const navigate = useNavigate();

  const { messages, isLoading, mode, addUserMessage, addAssistantMessage, setLoading, setMode, clearChat } = useQueryStore();
  const { setHighlightedNodes } = useSessionStore();

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendQuery = async () => {
    if (!input.trim() || !sessionId || isLoading) return;
    const question = input.trim();
    setInput('');
    addUserMessage(question);
    setLoading(true);

    try {
      const raw = await queryService.ask({ session_id: sessionId, question, mode });
      const res = adaptQuery(raw);

      addAssistantMessage({
        content: res.answer,
        sources: res.sources,
        confidence: res.confidence,
        highlightedNodes: res.highlighted_nodes,
        mode: res.mode as ExplanationMode,
      });

      if (res.highlighted_nodes.length > 0) {
        setHighlightedNodes(res.highlighted_nodes);
      }
    } catch (e: any) {
      addAssistantMessage({ content: `Error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const hasHighlights = (lastAssistant?.highlightedNodes?.length ?? 0) > 0;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="p-6 pb-0">
          <PageHeader
            title="Ask Repo"
            subtitle="Natural language questions about this codebase"
            actions={
              <div className="flex items-center gap-2">
                {hasHighlights && (
                  <Button size="sm" variant="secondary"
                    leftIcon={<Network className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/graph/${sessionId}`)}>
                    Open in Graph
                  </Button>
                )}
                {messages.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearChat}>Clear chat</Button>
                )}
              </div>
            }
          />

          {/* Mode selector */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-slate-500">Mode:</span>
            {(['intern', 'engineer', 'architect'] as ExplanationMode[]).map((m) => (
              <div key={m} className="group relative">
                <ModeChip mode={m} active={mode === m} onClick={() => setMode(m)} />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-[#131d2e] border border-white/10 text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {EXPLANATION_MODE_DESCRIPTIONS[m]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <EmptyState
                icon={<Bot className="w-12 h-12" />}
                title="Ask anything about the repository"
                description="Questions like 'How does authentication work?' or 'What are the main entry points?'"
              />
            </div>
          )}
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-violet-600/50 border border-violet-500/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-violet-300" />
              </div>
              <div className="bg-[#131d2e] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                <span className="text-sm text-slate-400">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="p-6 pt-0">
          <div className="glass rounded-xl p-3 flex gap-3 items-end">
            <textarea
              rows={2}
              placeholder={`Ask in ${mode} mode…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuery(); } }}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 text-sm resize-none focus:outline-none leading-relaxed"
            />
            <Button
              onClick={sendQuery}
              isLoading={isLoading}
              disabled={!input.trim()}
              size="sm"
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 px-1">Enter to send · Shift+Enter for newline</p>
        </div>
      </div>
    </AppLayout>
  );
}
