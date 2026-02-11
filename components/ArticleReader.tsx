'use client';

import { X, ExternalLink, Clock } from 'lucide-react';
import type { Card } from '@/lib/db-types';

interface ArticleReaderProps {
  card: Card;
  onClose: () => void;
}

export function ArticleReader({ card, onClose }: ArticleReaderProps) {
  const sourceColor = {
    telegram: 'bg-sky-500/20 text-sky-400',
    rss: 'bg-amber-500/20 text-amber-400',
    reddit: 'bg-red-500/20 text-red-400',
  }[card.source_type] || 'bg-zinc-500/20 text-zinc-400';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="article-enter fixed inset-x-0 bottom-0 top-12 bg-zinc-950 rounded-t-2xl overflow-hidden flex flex-col border-t border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sourceColor}`}>
              {card.source_type}
            </span>
            <span className="text-zinc-500 text-sm truncate max-w-[200px]">{card.source_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={card.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Open original"
            >
              <ExternalLink size={18} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Article content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {card.image_url && (
            <div className="rounded-xl overflow-hidden mb-6 bg-zinc-900">
              <img src={card.image_url} alt="" className="w-full max-h-64 object-cover" />
            </div>
          )}

          <h1 className="text-2xl font-bold leading-tight mb-3">{card.title}</h1>

          <div className="flex items-center gap-3 text-sm text-zinc-500 mb-6">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(card.created_at)}
            </span>
          </div>

          <div className="text-zinc-300 leading-relaxed text-base whitespace-pre-wrap">
            {card.content}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <a
              href={card.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} />
              Read full article
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
