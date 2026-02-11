'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, RefreshCw, Loader2 } from 'lucide-react';
import type { Topic, Card } from '@/lib/db-types';
import { CardItem } from '@/components/CardItem';
import { ArticleReader } from '@/components/ArticleReader';
import { SettingsPanel } from '@/components/SettingsPanel';

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then(d => setTopics(d.topics || []));
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const url = selectedTopic ? `/api/cards?topicId=${selectedTopic}` : '/api/cards';
    const data = await fetch(url).then(r => r.json());
    setCards(data.cards || []);
    setLoading(false);
  }, [selectedTopic]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = selectedTopic ? `/api/cards?topicId=${selectedTopic}` : '/api/cards';
      const data = await fetch(url).then(r => r.json());
      if (!cancelled) {
        setCards(data.cards || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTopic]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetch('/api/cron').catch(() => {});
    await fetchCards();
    setRefreshing(false);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <h1 className="text-xl font-bold tracking-tight">Smart Scroll</h1>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh content"
              >
                {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Manage sources"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Topic pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedTopic === null
                  ? 'bg-white text-black'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
              }`}
            >
              All
            </button>
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedTopic === topic.id
                    ? 'bg-white text-black'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
                }`}
              >
                {topic.icon} {topic.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-zinc-600" size={24} />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-zinc-500 mb-2">No content yet</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              Fetch content
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <CardItem key={card.id} card={card} onClick={() => setSelectedCard(card)} />
            ))}
          </div>
        )}
      </main>

      {/* Article reader overlay */}
      {selectedCard && (
        <ArticleReader card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel onClose={() => { setShowSettings(false); fetchCards(); }} />
      )}
    </div>
  );
}
