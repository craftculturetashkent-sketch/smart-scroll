import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchTelegramChannel } from '@/lib/fetchTelegram';
import { fetchRSSFeed } from '@/lib/fetchRSS';
import { fetchRedditSubreddit } from '@/lib/fetchReddit';
import type { Topic } from '@/lib/db-types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

export async function GET(request: Request) {
  try {
    // Verify authorization (basic security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow requests without auth in development
      if (process.env.NODE_ENV === 'production' && !authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    console.log('Starting content fetch...');
    
    // Get all topics
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*');
    
    if (topicsError) {
      throw topicsError;
    }
    
    let totalCards = 0;
    
    for (const topic of (topics as Topic[])) {
      console.log(`Processing topic: ${topic.name}`);
      
      // Fetch from Telegram channels
      for (const channel of topic.telegram_channels || []) {
        try {
          const posts = await fetchTelegramChannel(channel);
          for (const post of posts) {
            await insertCard(topic.id, post, 'telegram');
            totalCards++;
          }
          console.log(`  ✓ ${channel}: ${posts.length} posts`);
        } catch (error) {
          console.error(`  ✗ ${channel}:`, error);
        }
      }
      
      // Fetch from RSS feeds
      for (const feed of topic.rss_feeds || []) {
        try {
          const posts = await fetchRSSFeed(feed);
          for (const post of posts) {
            await insertCard(topic.id, post, 'rss');
            totalCards++;
          }
          console.log(`  ✓ RSS: ${posts.length} posts`);
        } catch (error) {
          console.error(`  ✗ RSS ${feed}:`, error);
        }
      }
      
      // Fetch from Reddit
      for (const subreddit of topic.subreddits || []) {
        try {
          const posts = await fetchRedditSubreddit(subreddit);
          for (const post of posts) {
            await insertCard(topic.id, post, 'reddit');
            totalCards++;
          }
          console.log(`  ✓ r/${subreddit}: ${posts.length} posts`);
        } catch (error) {
          console.error(`  ✗ r/${subreddit}:`, error);
        }
      }
    }
    
    console.log(`Fetch complete! Total cards: ${totalCards}`);
    
    return NextResponse.json({
      success: true,
      message: `Fetched ${totalCards} cards`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

async function insertCard(
  topicId: number,
  post: { title: string; content: string; imageUrl?: string; sourceUrl: string; sourceName: string; timestamp: Date },
  sourceType: 'telegram' | 'rss' | 'reddit'
) {
  // Check if card already exists
  const { data: existing } = await supabase
    .from('cards')
    .select('id')
    .eq('source_url', post.sourceUrl)
    .single();
  
  if (existing) {
    return; // Skip duplicates
  }
  
  // Insert new card
  const { error } = await supabase.from('cards').insert({
    topic_id: topicId,
    title: post.title,
    content: post.content,
    image_url: post.imageUrl,
    source_url: post.sourceUrl,
    source_name: post.sourceName,
    source_type: sourceType,
    score: 0,
    created_at: post.timestamp.toISOString()
  });
  
  if (error) {
    console.error('Error inserting card:', error);
  }
}
