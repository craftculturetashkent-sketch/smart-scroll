import axios from 'axios';

export interface RedditPost {
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceName: string;
  timestamp: Date;
}

export async function fetchRedditSubreddit(subreddit: string): Promise<RedditPost[]> {
  const posts: RedditPost[] = [];
  
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SmartScroll/1.0'
      }
    });
    
    const items = response.data?.data?.children || [];
    
    for (const item of items) {
      const post = item.data;
      
      if (!post.title) continue;
      
      const title = post.title;
      const content = post.selftext || post.title;
      const link = `https://www.reddit.com${post.permalink}`;
      const timestamp = new Date(post.created_utc * 1000);
      
      // Extract image
      let imageUrl: string | undefined;
      if (post.preview?.images?.[0]?.source?.url) {
        imageUrl = post.preview.images[0].source.url.replace(/&amp;/g, '&');
      } else if (post.thumbnail && post.thumbnail.startsWith('http')) {
        imageUrl = post.thumbnail;
      }
      
      posts.push({
        title: title.substring(0, 200),
        content: content.substring(0, 500),
        imageUrl,
        sourceUrl: link,
        sourceName: `r/${subreddit}`,
        timestamp
      });
    }
    
  } catch (error) {
    console.error(`Error fetching Reddit r/${subreddit}:`, error);
  }
  
  return posts;
}
