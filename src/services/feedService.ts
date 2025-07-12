import { PodcastFeed } from '../types/podcast';

export interface FeedServiceError {
  type: 'network' | 'parse' | 'validation' | 'unknown';
  message: string;
  feedUrl?: string;
  originalError?: Error;
}

export const createFeedServiceError = (
  type: FeedServiceError['type'],
  message: string,
  feedUrl?: string,
  originalError?: Error
): FeedServiceError => ({
  type,
  message,
  feedUrl,
  originalError,
});

export class FeedService {
  static async fetchFeed(feedUrl: string): Promise<PodcastFeed> {
    try {
      const response = await fetch(`/api/parse-feed?url=${encodeURIComponent(feedUrl)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const feed = await response.json();
      
      if (!feed || !feed.title || !Array.isArray(feed.episodes)) {
        throw new Error('Invalid feed structure received');
      }
      
      return feed;
    } catch (error) {
      const originalError = error instanceof Error ? error : new Error(String(error));
      
      if (originalError.message.includes('fetch')) {
        throw createFeedServiceError(
          'network',
          `Failed to fetch feed: ${originalError.message}`,
          feedUrl,
          originalError
        );
      }
      
      if (originalError.message.includes('parse')) {
        throw createFeedServiceError(
          'parse',
          `Failed to parse feed: ${originalError.message}`,
          feedUrl,
          originalError
        );
      }
      
      throw createFeedServiceError(
        'unknown',
        `Unexpected error: ${originalError.message}`,
        feedUrl,
        originalError
      );
    }
  }

  static async fetchMultipleFeeds(feedUrls: string[]): Promise<PodcastFeed[]> {
    const feedPromises = feedUrls.map(async (url) => {
      try {
        return await this.fetchFeed(url);
      } catch (error) {
        console.error(`Failed to fetch feed ${url}:`, error);
        // Return a placeholder feed to prevent complete failure
        return {
          title: `Failed to load: ${url}`,
          url,
          description: 'Failed to load this feed',
          imageUrl: undefined,
          episodes: [],
        };
      }
    });

    return Promise.all(feedPromises);
  }
} 