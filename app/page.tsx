'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, RefreshCw, Loader2 } from 'lucide-react';
import type { Topic, Card } from '@/lib/db-types';
import { CardItem } from '@/components/CardItem';
import { ArticleReader } from '@/components/ArticleReader';
import { SettingsPanel } from '@/components/SettingsPanel';

const PAGE_SIZE = 20;

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then(d => setTopics(d.topics || []));
  }, []);

  const fetchCards = useCallback(async (offset = 0, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (selectedTopic) params.set('topicId', String(selectedTopic));

    const data = await fetch(`/api/cards?${params}`).then(r => r.json());
    const newCards = data.cards || [];

    if (append) {
      setCards(prev => [...prev, ...newCards]);
    } else {
      setCards(newCards);
    }
    setHasMore(newCards.length >= PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, [selectedTopic]);

  // Initial load + topic change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: '0' });
      if (selectedTopic) params.set('topicId', String(selectedTopic));
      const data = await fetch(`/api/cards?${params}`).then(r => r.json());
      if (!cancelled) {
        setCards(data.cards || []);
        setHasMore((data.cards || []).length >= PAGE_SIZE);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTopic]);

  // Infinite scroll observer
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchCards(cards.length, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, cards.length, fetchCards]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetch('/api/cron').catch(() => {});
    await fetchCards(0, false);
    setRefreshing(false);
  }

  return (
    <div className="min-h-screen">
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

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="py-8 flex justify-center">
              {loadingMore && <Loader2 className="animate-spin text-zinc-600" size={20} />}
              {!hasMore && cards.length > 0 && (
                <p className="text-zinc-700 text-sm">You&apos;re all caught up ✓</p>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedCard && (
        <ArticleReader card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => { setShowSettings(false); fetchCards(0, false); }} />
      )}
    </div>
  );
}
