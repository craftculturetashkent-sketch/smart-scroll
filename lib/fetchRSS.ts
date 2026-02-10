import Parser from 'rss-parser';

export interface RSSPost {
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceName: string;
  timestamp: Date;
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; SmartScroll/1.0)',
  },
});

export async function fetchRSSFeed(feedUrl: string): Promise<RSSPost[]> {
  const posts: RSSPost[] = [];
  
  try {
    const feed = await parser.parseURL(feedUrl);
    
    const items = feed.items.slice(0, 10);
    
    for (const item of items) {
      const title = item.title || 'Untitled';
      const content = item.contentSnippet || item.content || item.summary || '';
      const link = item.link || feedUrl;
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      
      // Try to extract image
      let imageUrl: string | undefined;
      if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      } else if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }
      
      posts.push({
        title: title.substring(0, 200),
        content: content.substring(0, 500),
        imageUrl,
        sourceUrl: link,
        sourceName: feed.title || new URL(feedUrl).hostname,
        timestamp: pubDate
      });
    }
    
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
  }
  
  return posts;
}
