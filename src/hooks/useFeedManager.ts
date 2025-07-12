/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { usePodcastStore } from '../store/podcastStore';
import { FeedService } from '../services/feedService';
import { PODCAST_FEEDS } from '../config/podcasts';

export interface FeedManagerState {
  isLoading: boolean;
  error: string | null;
  feedsCount: number;
  episodesCount: number;
  playerHydrated: boolean;
}

export interface FeedManagerActions {
  initializeFeeds: () => Promise<void>;
  retryLoad: () => Promise<void>;
}

export const useFeedManager = (): [FeedManagerState, FeedManagerActions] => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [playerHydrated, setPlayerHydrated] = useState(false);
  
  const {
    feeds,
    isLoading,
    error,
    setLoading,
    setError,
    setFeeds,
    player,
    setPlayerState,
    episodeProgress,
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

  // After feeds are loaded, restore player state with correct episode object
  useEffect(() => {
    if (feeds.length > 0) {
      if (player.currentEpisode) {
        const allEpisodes = feeds.flatMap(feed => feed.episodes);
        const match = allEpisodes.find(ep => ep.id === player.currentEpisode?.id);
        if (match) {
          setPlayerState({ currentEpisode: match });
          // Restore currentTime if available
          const saved = episodeProgress[match.id];
          if (typeof saved === 'number' && saved > 0) {
            setPlayerState({ currentTime: saved });
          }
        } else {
          // Episode not found in new feeds, clear player
          setPlayerState({ currentEpisode: null, isPlaying: false, currentTime: 0, duration: 0 });
        }
      }
      setPlayerHydrated(true);
    }
  }, [feeds, player.currentEpisode?.id]);

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
    playerHydrated,
  };

  const actions: FeedManagerActions = {
    initializeFeeds,
    retryLoad,
  };

  return [state, actions];
}; 