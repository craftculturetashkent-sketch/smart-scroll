'use client';

import { useMemo } from 'react';
import type { Card } from '@/lib/db-types';

interface CardItemProps {
  card: Card;
  onClick: () => void;
}

function formatTimeAgo(d: string): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function CardItem({ card, onClick }: CardItemProps) {
  const sourceStyle = {
    telegram: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    rss: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    reddit: 'bg-red-500/15 text-red-400 border-red-500/20',
  }[card.source_type] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';

  const timeAgo = useMemo(() => formatTimeAgo(card.created_at), [card.created_at]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl overflow-hidden transition-all duration-200 group"
    >
      {card.image_url && (
        <div className="aspect-[2/1] bg-zinc-900 overflow-hidden">
          <img
            src={card.image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${sourceStyle}`}>
            {card.source_type}
          </span>
          <span className="text-zinc-600 text-xs truncate">{card.source_name}</span>
          <span className="text-zinc-700 text-xs ml-auto shrink-0">{timeAgo}</span>
        </div>

        <h3 className="font-semibold text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-white transition-colors">
          {card.title}
        </h3>

        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
          {card.content}
        </p>
      </div>
    </button>
  );
}
