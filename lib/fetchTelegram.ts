import * as cheerio from 'cheerio';
import axios from 'axios';

export interface TelegramPost {
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceName: string;
  timestamp: Date;
}

export async function fetchTelegramChannel(channelName: string): Promise<TelegramPost[]> {
  const posts: TelegramPost[] = [];
  
  try {
    // Try RSSHub first
    const rsshubUrl = `https://rsshub.app/telegram/channel/${channelName}`;
    try {
      const rsshubResponse = await axios.get(rsshubUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (rsshubResponse.status === 200 && rsshubResponse.data) {
        const $ = cheerio.load(rsshubResponse.data, { xmlMode: true });
        
        $('item').slice(0, 10).each((_, item) => {
          const $item = $(item);
          const title = $item.find('title').text().trim() || 'Untitled';
          const description = $item.find('description').text().trim();
          const link = $item.find('link').text().trim();
          const pubDate = $item.find('pubDate').text();
          
          // Extract image from description
          const $desc = cheerio.load(description);
          const img = $desc('img').first().attr('src');
          
          posts.push({
            title: title.substring(0, 200),
            content: $desc.text().substring(0, 500),
            imageUrl: img,
            sourceUrl: link || `https://t.me/s/${channelName}`,
            sourceName: channelName,
            timestamp: pubDate ? new Date(pubDate) : new Date()
          });
        });
        
        if (posts.length > 0) {
          return posts;
        }
      }
    } catch (rsshubError) {
      console.log(`RSSHub failed for ${channelName}, trying direct scraping...`);
    }
    
    // Fallback to direct Telegram scraping
    const telegramUrl = `https://t.me/s/${channelName}`;
    const response = await axios.get(telegramUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    $('.tgme_widget_message').slice(0, 10).each((_, element) => {
      const $el = $(element);
      const messageText = $el.find('.tgme_widget_message_text').text().trim();
      const messageLink = $el.find('.tgme_widget_message_date').attr('href');
      const messageImg = $el.find('.tgme_widget_message_photo_wrap').attr('style');
      
      let imageUrl: string | undefined;
      if (messageImg) {
        const match = messageImg.match(/url\('([^']+)'\)/);
        if (match) imageUrl = match[1];
      }
      
      if (messageText) {
        const title = messageText.substring(0, 100) + (messageText.length > 100 ? '...' : '');
        posts.push({
          title,
          content: messageText.substring(0, 500),
          imageUrl,
          sourceUrl: messageLink || telegramUrl,
          sourceName: channelName,
          timestamp: new Date()
        });
      }
    });
    
  } catch (error) {
    console.error(`Error fetching Telegram channel ${channelName}:`, error);
  }
  
  return posts;
}
