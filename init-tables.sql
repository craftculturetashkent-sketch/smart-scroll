-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  telegram_channels TEXT[],
  rss_feeds TEXT[],
  subreddits TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id INT REFERENCES topics(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  source_url TEXT UNIQUE,
  source_name TEXT,
  source_type TEXT,
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cards_topic_id ON cards(topic_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_source_url ON cards(source_url);

-- Insert seed topics
INSERT INTO topics (name, icon, telegram_channels, rss_feeds, subreddits)
VALUES
  ('Entrepreneurship', '🚀', ARRAY['thedankoe', 'sweatystartup', 'indiehackers_feed'], ARRAY['http://www.paulgraham.com/rss.html'], ARRAY['entrepreneur', 'startups']),
  ('AI & Tech', '🤖', ARRAY['OpenAI_Updates', 'ai_newschannel'], ARRAY['https://techcrunch.com/feed/'], ARRAY['LocalLLaMA', 'artificial']),
  ('Central Asia', '🏔️', ARRAY['silkroadstories', 'centralasianews'], ARRAY[]::TEXT[], ARRAY['CentralAsia', 'uzbekistan']),
  ('Languages', '🗣️', ARRAY['learnarbic_daily'], ARRAY[]::TEXT[], ARRAY['languagelearning', 'learn_arabic']),
  ('Business Insights', '💡', ARRAY[]::TEXT[], ARRAY['https://stratechery.com/feed/', 'https://www.notboring.co/feed'], ARRAY[]::TEXT[])
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  telegram_channels = EXCLUDED.telegram_channels,
  rss_feeds = EXCLUDED.rss_feeds,
  subreddits = EXCLUDED.subreddits;
