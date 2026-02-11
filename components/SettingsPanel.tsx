'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Rss, Send, Globe } from 'lucide-react';
import type { Topic } from '@/lib/db-types';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicIcon, setNewTopicIcon] = useState('📌');
  const [addingSource, setAddingSource] = useState<{ topicId: number; type: string } | null>(null);
  const [newSource, setNewSource] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then(d => setTopics(d.topics || []));
  }, []);

  async function addTopic() {
    if (!newTopicName.trim()) return;
    setSaving(true);
    const res = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTopicName, icon: newTopicIcon }),
    });
    const data = await res.json();
    if (data.topic) setTopics(prev => [...prev, data.topic]);
    setNewTopicName('');
    setNewTopicIcon('📌');
    setSaving(false);
  }

  async function addSource(topicId: number, type: string, value: string) {
    if (!value.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/topics/${topicId}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value: value.trim().replace(/^@/, '') }),
    });
    if (res.ok) {
      const data = await res.json();
      setTopics(prev => prev.map(t => t.id === topicId ? data.topic : t));
    }
    setNewSource('');
    setAddingSource(null);
    setSaving(false);
  }

  async function removeSource(topicId: number, type: string, value: string) {
    const res = await fetch(`/api/topics/${topicId}/sources`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value }),
    });
    if (res.ok) {
      const data = await res.json();
      setTopics(prev => prev.map(t => t.id === topicId ? data.topic : t));
    }
  }

  async function deleteTopic(topicId: number) {
    if (!confirm('Delete this topic and all its cards?')) return;
    const res = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
    if (res.ok) setTopics(prev => prev.filter(t => t.id !== topicId));
  }

  const sourceIcon = (type: string) => {
    if (type === 'telegram') return <Send size={14} className="text-sky-400" />;
    if (type === 'rss') return <Rss size={14} className="text-amber-400" />;
    return <Globe size={14} className="text-red-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="article-enter fixed inset-x-0 bottom-0 top-12 bg-zinc-950 rounded-t-2xl overflow-hidden flex flex-col border-t border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50 shrink-0">
          <h2 className="text-lg font-semibold">Sources & Topics</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Add new topic */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Add Topic</h3>
            <div className="flex gap-2">
              <input
                value={newTopicIcon}
                onChange={(e) => setNewTopicIcon(e.target.value)}
                className="w-12 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-center text-lg"
                maxLength={2}
              />
              <input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Topic name..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                onKeyDown={(e) => e.key === 'Enter' && addTopic()}
              />
              <button
                onClick={addTopic}
                disabled={saving || !newTopicName.trim()}
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Topics list */}
          {topics.map((topic) => (
            <div key={topic.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{topic.icon} {topic.name}</h3>
                <button onClick={() => deleteTopic(topic.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-600 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Existing sources */}
              <div className="space-y-1.5 mb-3">
                {(topic.telegram_channels || []).map((ch) => (
                  <div key={ch} className="flex items-center gap-2 text-sm group">
                    {sourceIcon('telegram')}
                    <span className="text-zinc-300">@{ch}</span>
                    <button onClick={() => removeSource(topic.id, 'telegram', ch)} className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded">
                      <X size={12} className="text-zinc-500" />
                    </button>
                  </div>
                ))}
                {(topic.rss_feeds || []).map((feed) => (
                  <div key={feed} className="flex items-center gap-2 text-sm group">
                    {sourceIcon('rss')}
                    <span className="text-zinc-300 truncate">{feed}</span>
                    <button onClick={() => removeSource(topic.id, 'rss', feed)} className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded shrink-0">
                      <X size={12} className="text-zinc-500" />
                    </button>
                  </div>
                ))}
                {(topic.subreddits || []).map((sub) => (
                  <div key={sub} className="flex items-center gap-2 text-sm group">
                    {sourceIcon('reddit')}
                    <span className="text-zinc-300">r/{sub}</span>
                    <button onClick={() => removeSource(topic.id, 'reddit', sub)} className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded">
                      <X size={12} className="text-zinc-500" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add source */}
              {addingSource?.topicId === topic.id ? (
                <div className="flex gap-2 mt-2">
                  <select
                    value={addingSource.type}
                    onChange={(e) => setAddingSource({ ...addingSource, type: e.target.value })}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="rss">RSS Feed</option>
                    <option value="reddit">Reddit</option>
                  </select>
                  <input
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder={addingSource.type === 'rss' ? 'https://blog.com/feed' : addingSource.type === 'telegram' ? '@channel' : 'subreddit'}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                    onKeyDown={(e) => e.key === 'Enter' && addSource(topic.id, addingSource.type, newSource)}
                    autoFocus
                  />
                  <button
                    onClick={() => addSource(topic.id, addingSource.type, newSource)}
                    disabled={!newSource.trim()}
                    className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button onClick={() => { setAddingSource(null); setNewSource(''); }} className="p-1.5 hover:bg-zinc-800 rounded-lg">
                    <X size={14} className="text-zinc-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSource({ topicId: topic.id, type: 'telegram' })}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mt-1"
                >
                  <Plus size={14} /> Add source
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
