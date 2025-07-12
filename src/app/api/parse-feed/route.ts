import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { PodcastFeed, PodcastEpisode } from '../../../types/podcast';

const parser = new Parser({
  customFields: {
    item: [
      ['enclosure', 'enclosure', { keepArray: true }],
      ['itunes:duration', 'duration'],
      ['itunes:image', 'image'],
    ],
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const feed = await parser.parseURL(url);
    
    const episodes: PodcastEpisode[] = feed.items.map((item, index) => {
      const enclosure = item.enclosure?.[0] || item.enclosure;
      const audioUrl = enclosure?.url || '';
      const duration = parseDuration(item.duration || '0');
      
      return {
        id: `${feed.title}-${index}-${item.guid || item.link || item.title}`,
        title: item.title || 'Untitled',
        description: item.contentSnippet || item.content || '',
        audioUrl,
        duration,
        pubDate: parseDate(item.pubDate) || new Date(),
        feedTitle: feed.title || 'Unknown Feed',
        feedUrl: url,
        imageUrl: item.image?.href || feed.image?.url,
        isPlayed: false,
        currentTime: 0,
      };
    });

    const podcastFeed: PodcastFeed = {
      title: feed.title || 'Unknown Feed',
      url,
      description: feed.description || '',
      imageUrl: feed.image?.url,
      episodes,
    };

    return NextResponse.json(podcastFeed);
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to parse RSS feed' },
      { status: 500 }
    );
  }
}

function parseDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  
  // Handle formats like "1:23:45" or "23:45" or "45"
  const parts = duration.split(':').map(Number);
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS
    return parts[0];
  }
  
  return 0;
} 