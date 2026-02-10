import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  console.log('Initializing database...');
  
  // Create topics table
  const { error: topicsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        telegram_channels TEXT[],
        rss_feeds TEXT[],
        subreddits TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (topicsError) {
    console.log('Topics table might already exist or using direct SQL...');
  }
  
  // Create cards table
  const { error: cardsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic_id INT REFERENCES topics(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        source_url TEXT,
        source_name TEXT,
        source_type TEXT,
        score INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_cards_topic_id ON cards(topic_id);
      CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);
    `
  });
  
  if (cardsError) {
    console.log('Cards table might already exist...');
  }
  
  // Insert seed topics
  const topics = [
    {
      name: 'Entrepreneurship',
      icon: '🚀',
      telegram_channels: ['thedankoe', 'sweatystartup', 'indiehackers_feed'],
      rss_feeds: ['http://www.paulgraham.com/rss.html'],
      subreddits: ['entrepreneur', 'startups']
    },
    {
      name: 'AI & Tech',
      icon: '🤖',
      telegram_channels: ['OpenAI_Updates', 'ai_newschannel'],
      rss_feeds: ['https://techcrunch.com/feed/'],
      subreddits: ['LocalLLaMA', 'artificial']
    },
    {
      name: 'Central Asia',
      icon: '🏔️',
      telegram_channels: ['silkroadstories', 'centralasianews'],
      rss_feeds: [],
      subreddits: ['CentralAsia', 'uzbekistan']
    },
    {
      name: 'Languages',
      icon: '🗣️',
      telegram_channels: ['learnarbic_daily'],
      rss_feeds: [],
      subreddits: ['languagelearning', 'learn_arabic']
    },
    {
      name: 'Business Insights',
      icon: '💡',
      telegram_channels: [],
      rss_feeds: [
        'https://stratechery.com/feed/',
        'https://www.notboring.co/feed'
      ],
      subreddits: []
    }
  ];
  
  for (const topic of topics) {
    const { error } = await supabase
      .from('topics')
      .upsert(topic, { onConflict: 'name' });
    
    if (error) {
      console.error(`Error inserting topic ${topic.name}:`, error);
    } else {
      console.log(`✓ Inserted/updated topic: ${topic.name}`);
    }
  }
  
  console.log('Database initialization complete!');
}

initDatabase().catch(console.error);
