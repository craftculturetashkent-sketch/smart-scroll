'use client';

import { useState, useEffect } from 'react';
import type { Topic, Card } from '@/lib/db-types';

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (topics.length > 0) {
      fetchCards();
    }
  }, [selectedTopic, topics]);

  async function fetchTopics() {
    try {
      const response = await fetch('/api/topics');
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  }

  async function fetchCards() {
    setLoading(true);
    try {
      const url = selectedTopic
        ? `/api/cards?topicId=${selectedTopic}`
        : '/api/cards';
      const response = await fetch(url);
      const data = await response.json();
      setCards(data.cards || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  }

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'telegram':
        return 'bg-blue-500';
      case 'rss':
        return 'bg-orange-500';
      case 'reddit':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Smart Scroll 📱</h1>
          
          {/* Topic Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedTopic === null
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedTopic === topic.id
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {topic.icon} {topic.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Cards Feed */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-gray-500 text-center">
              No cards yet. Run the cron job to fetch content!
              <br />
              <code className="text-sm bg-gray-800 px-2 py-1 rounded mt-2 inline-block">
                curl {typeof window !== 'undefined' && window.location.origin}/api/cron
              </code>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <a
                key={card.id}
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-800 transition-all border border-gray-800 hover:border-gray-700"
              >
                {card.image_url && (
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                
                <div className="p-5">
                  {/* Source Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`${getSourceColor(
                        card.source_type
                      )} px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {card.source_type.toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {card.source_name}
                    </span>
                    <span className="text-gray-600 text-xs ml-auto">
                      {formatTimeAgo(card.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">
                    {card.title}
                  </h2>

                  {/* Content Preview */}
                  <p className="text-gray-400 line-clamp-3 text-sm leading-relaxed">
                    {card.content}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
