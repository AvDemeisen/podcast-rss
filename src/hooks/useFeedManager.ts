import { useEffect, useState } from 'react';
import { usePodcastStore } from '../store/podcastStore';
import { FeedService } from '../services/feedService';
import { PODCAST_FEEDS } from '../config/podcasts';

export interface FeedManagerState {
  isLoading: boolean;
  error: string | null;
  feedsCount: number;
  episodesCount: number;
}

export interface FeedManagerActions {
  initializeFeeds: () => Promise<void>;
  retryLoad: () => Promise<void>;
}

export const useFeedManager = (): [FeedManagerState, FeedManagerActions] => {
  const [isHydrated, setIsHydrated] = useState(false);
  
  const {
    feeds,
    isLoading,
    error,
    setLoading,
    setError,
    setFeeds,
  } = usePodcastStore();

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize feeds on component mount after hydration
  useEffect(() => {
    if (isHydrated && feeds.length === 0) {
      initializeFeeds();
    }
  }, [isHydrated, feeds.length]);

  const initializeFeeds = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const feedUrls = PODCAST_FEEDS.map(feed => feed.url);
      const loadedFeeds = await FeedService.fetchMultipleFeeds(feedUrls);
      setFeeds(loadedFeeds);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load feeds';
      setError(errorMessage);
      console.error('Feed initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = async (): Promise<void> => {
    await initializeFeeds();
  };

  const feedsCount = feeds.length;
  const episodesCount = feeds.reduce((total, feed) => total + feed.episodes.length, 0);

  const state: FeedManagerState = {
    isLoading,
    error,
    feedsCount,
    episodesCount,
  };

  const actions: FeedManagerActions = {
    initializeFeeds,
    retryLoad,
  };

  return [state, actions];
}; 