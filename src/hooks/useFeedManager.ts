/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { PODCAST_FEEDS } from '../config/podcasts';
import { PodcastFeed } from '../types/podcast';
import { usePlayer } from '../contexts/PlayerContext';

interface FeedState {
  feeds: PodcastFeed[];
  isLoading: boolean;
  error: string | null;
  feedsCount: number;
  playerHydrated: boolean;
}

interface FeedActions {
  retryLoad: () => void;
}

export const useFeedManager = (): [FeedState, FeedActions] => {
  const [feeds, setFeeds] = useState<PodcastFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerHydrated, setPlayerHydrated] = useState(false);
  
  const { restoreEpisodeFromFeeds } = usePlayer();

  const loadFeeds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const feedPromises = PODCAST_FEEDS.map(async (configFeed) => {
        const response = await fetch(`/api/parse-feed?url=${encodeURIComponent(configFeed.url)}`);
        if (!response.ok) {
          throw new Error(`Failed to parse RSS feed: ${configFeed.name}`);
        }
        return await response.json();
      });

      const loadedFeeds = await Promise.all(feedPromises);
      setFeeds(loadedFeeds);
      
      // After feeds are loaded, try to restore the saved episode
      restoreEpisodeFromFeeds(loadedFeeds);
      setPlayerHydrated(true);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load feeds');
    } finally {
      setIsLoading(false);
    }
  }, [restoreEpisodeFromFeeds]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  const retryLoad = useCallback(() => {
    loadFeeds();
  }, [loadFeeds]);

  const state: FeedState = {
    feeds,
    isLoading,
    error,
    feedsCount: feeds.length,
    playerHydrated,
  };

  const actions: FeedActions = {
    retryLoad,
  };

  return [state, actions];
}; 