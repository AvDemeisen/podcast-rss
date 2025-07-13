import { useState, useEffect, useCallback } from 'react';
import { PodcastEpisode, PodcastFeed } from '../types/podcast';
import { storage } from '../utils/storage';

interface PlayerState {
  currentEpisode: PodcastEpisode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

interface SavedPlayerState {
  currentEpisodeId: string | null;
  currentTime: number;
  episodeProgress: Record<string, number>;
}

export const usePlayerState = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentEpisode: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
  });

  const [episodeProgress, setEpisodeProgress] = useState<Record<string, number>>({});

  // Load initial state from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading player state from localStorage...');
    const savedState = storage.get();
    
    if (savedState) {
      setPlayerState(prev => ({
        ...prev,
        currentTime: savedState.currentTime || 0,
      }));
      setEpisodeProgress(savedState.episodeProgress || {});
      console.log('✅ Loaded saved state:', savedState);
    } else {
      console.log('ℹ️ No saved state found');
    }
  }, []);

  // Save state to localStorage whenever it changes
  const saveToStorage = useCallback((episode: PodcastEpisode | null, time: number, progress: Record<string, number>) => {
    const data: SavedPlayerState = {
      currentEpisodeId: episode?.id || null,
      currentTime: time,
      episodeProgress: progress,
    };
    storage.set(data);
  }, []);

  // Play episode
  const playEpisode = useCallback((episode: PodcastEpisode) => {
    console.log('🎵 Playing episode:', episode.title);
    console.log('🎵 Episode details:', {
      id: episode.id,
      audioUrl: episode.audioUrl,
      title: episode.title,
      feedTitle: episode.feedTitle,
    });
    
    setPlayerState(prev => ({
      ...prev,
      currentEpisode: episode,
      isPlaying: true,
      currentTime: 0, // Reset time when starting new episode
    }));
    
    // Save to localStorage
    saveToStorage(episode, 0, episodeProgress);
  }, [episodeProgress, saveToStorage]);

  // Pause episode
  const pauseEpisode = useCallback(() => {
    console.log('⏸️ Pausing episode');
    setPlayerState(prev => ({
      ...prev,
      isPlaying: false,
    }));
    
    // Save to localStorage
    saveToStorage(playerState.currentEpisode, playerState.currentTime, episodeProgress);
  }, [playerState.currentEpisode, playerState.currentTime, episodeProgress, saveToStorage]);

  // Update current time
  const updateCurrentTime = useCallback((time: number) => {
    setPlayerState(prev => ({
      ...prev,
      currentTime: time,
    }));
  }, []);

  // Save episode progress (called every 5 seconds while playing)
  const saveEpisodeProgress = useCallback((episodeId: string, currentTime: number) => {
    console.log('💾 Saving progress for episode:', episodeId, 'at time:', currentTime);
    setEpisodeProgress(prev => ({
      ...prev,
      [episodeId]: currentTime,
    }));
    
    // Save to localStorage
    saveToStorage(playerState.currentEpisode, currentTime, {
      ...episodeProgress,
      [episodeId]: currentTime,
    });
  }, [playerState.currentEpisode, episodeProgress, saveToStorage]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setPlayerState(prev => ({
      ...prev,
      volume: clampedVolume,
    }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  // Set duration
  const setDuration = useCallback((duration: number) => {
    setPlayerState(prev => ({
      ...prev,
      duration,
    }));
  }, []);

  // Reset player
  const resetPlayer = useCallback(() => {
    console.log('🔄 Resetting player');
    setPlayerState({
      currentEpisode: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
    });
    
    // Clear from localStorage
    saveToStorage(null, 0, {});
  }, [saveToStorage]);

  // Restore episode from feeds (called after feeds are loaded)
  const restoreEpisodeFromFeeds = useCallback((feeds: PodcastFeed[]) => {
    const savedState = storage.get();
    if (!savedState?.currentEpisodeId) {
      console.log('ℹ️ No saved episode to restore');
      return;
    }

    console.log('🔍 Looking for saved episode:', savedState.currentEpisodeId);
    
    let foundEpisode: PodcastEpisode | null = null;
    
    // Search through all feeds to find the episode
    for (const feed of feeds) {
      const episode = feed.episodes.find((ep: PodcastEpisode) => ep.id === savedState.currentEpisodeId);
      if (episode) {
        foundEpisode = episode;
        break;
      }
    }
    
    if (foundEpisode) {
      console.log('✅ Restoring episode:', foundEpisode.title, 'at time:', savedState.currentTime);
      setPlayerState(prev => ({
        ...prev,
        currentEpisode: foundEpisode,
        currentTime: savedState.currentTime || 0,
      }));
    } else {
      console.log('❌ Episode not found in feeds:', savedState.currentEpisodeId);
    }
  }, []);

  return {
    playerState,
    episodeProgress,
    playEpisode,
    pauseEpisode,
    updateCurrentTime,
    saveEpisodeProgress,
    setVolume,
    toggleMute,
    setDuration,
    resetPlayer,
    restoreEpisodeFromFeeds,
  };
}; 