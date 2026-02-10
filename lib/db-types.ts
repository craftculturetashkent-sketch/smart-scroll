export interface Topic {
  id: number;
  name: string;
  icon: string | null;
  telegram_channels: string[];
  rss_feeds: string[];
  subreddits: string[];
  created_at: string;
}

export interface Card {
  id: string;
  topic_id: number;
  title: string;
  content: string;
  image_url: string | null;
  source_url: string;
  source_name: string;
  source_type: 'telegram' | 'rss' | 'reddit';
  score: number;
  created_at: string;
}
