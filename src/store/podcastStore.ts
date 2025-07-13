import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, PodcastEpisode, PlayerState } from '../types/podcast';
import { PODCAST_FEEDS } from '../config/podcasts';

interface PodcastStore extends AppState {
  // Actions
  initializeFeeds: () => Promise<void>;
  setFeeds: (feeds: AppState['feeds']) => void;
  setPlayerState: (state: Partial<PlayerState>) => void;
  playEpisode: (episode: PodcastEpisode) => void;
  pauseEpisode: () => void;
  updateCurrentTime: (time: number) => void;
  markEpisodeAsPlayed: (episodeId: string) => void;
  hideEpisode: (episodeId: string) => void;
  showEpisode: (episodeId: string) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  saveEpisodeProgress: (episodeId: string, currentTime: number) => void;
  resetPlayer: () => void;
}

interface PersistedState {
  currentEpisodeId: string | null;
  currentTime: number;
  episodeProgress: Record<string, number>;
}

export const usePodcastStore = create<PodcastStore>()(
  persist(
    (set) => ({
      // Initial state
      feeds: [],
      player: {
        currentEpisode: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
      },
      hiddenEpisodes: new Set(),
      episodeProgress: {},
      isLoading: false,
      error: null,

      // Actions
      initializeFeeds: async () => {
        set({ isLoading: true, error: null });
        try {
          const feedPromises = PODCAST_FEEDS.map(async (configFeed) => {
            const response = await fetch(`/api/parse-feed?url=${encodeURIComponent(configFeed.url)}`);
            if (!response.ok) {
              throw new Error(`Failed to parse RSS feed: ${configFeed.name}`);
            }
            return await response.json();
          });

          const feeds = await Promise.all(feedPromises);
          set({ feeds, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load feeds',
            isLoading: false 
          });
        }
      },

      setPlayerState: (state) => {
        set((currentState) => ({
          player: { ...currentState.player, ...state },
        }));
      },

      playEpisode: (episode) => {
        // Validate episode has required fields
        if (!episode || !episode.audioUrl) {
          console.error('Invalid episode for playback:', episode);
          return;
        }
        
        set((state) => ({
          player: {
            ...state.player,
            currentEpisode: episode,
            isPlaying: true,
            currentTime: 0, // Reset time when starting new episode
          },
        }));
      },

      pauseEpisode: () => {
        set((state) => ({
          player: {
            ...state.player,
            isPlaying: false,
          },
        }));
      },

      updateCurrentTime: (time) => {
        // Validate time value
        if (typeof time !== 'number' || time < 0) {
          console.error('Invalid time value:', time);
          return;
        }
        
        set((state) => ({
          player: {
            ...state.player,
            currentTime: time,
          },
        }));
      },

      markEpisodeAsPlayed: (episodeId) => {
        set((state) => ({
          feeds: state.feeds.map(feed => ({
            ...feed,
            episodes: feed.episodes.map(episode =>
              episode.id === episodeId
                ? { ...episode, isPlayed: true }
                : episode
            ),
          })),
        }));
      },

      hideEpisode: (episodeId) => {
        set((state) => ({
          hiddenEpisodes: new Set([...state.hiddenEpisodes, episodeId]),
        }));
      },

      showEpisode: (episodeId) => {
        set((state) => {
          const newHidden = new Set(state.hiddenEpisodes);
          newHidden.delete(episodeId);
          return { hiddenEpisodes: newHidden };
        });
      },

      setVolume: (volume) => {
        // Clamp volume between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set((state) => ({
          player: {
            ...state.player,
            volume: clampedVolume,
          },
        }));
      },

      toggleMute: () => {
        set((state) => ({
          player: {
            ...state.player,
            isMuted: !state.player.isMuted,
          },
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setFeeds: (feeds) => {
        set({ feeds });
      },

      saveEpisodeProgress: (episodeId, currentTime) => {
        // Validate inputs
        if (!episodeId || typeof currentTime !== 'number' || currentTime < 0) {
          console.error('Invalid progress data:', { episodeId, currentTime });
          return;
        }
        
        set((state) => ({
          episodeProgress: {
            ...state.episodeProgress,
            [episodeId]: currentTime,
          },
        }));
      },

      resetPlayer: () => {
        set((state) => ({
          player: {
            ...state.player,
            currentEpisode: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
          },
        }));
      },
    }),
    {
      name: 'podcast-store',
      partialize: (state): PersistedState => ({
        // Only persist minimal data: current episode ID and timestamp
        currentEpisodeId: state.player.currentEpisode?.id || null,
        currentTime: state.player.currentTime,
        episodeProgress: state.episodeProgress,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Get the persisted data from localStorage
          const persistedData = localStorage.getItem('podcast-store');
          if (persistedData) {
            try {
              const hydratedState: PersistedState = JSON.parse(persistedData).state;
              
              // Restore currentEpisode from feeds if we have a saved episode ID
              if (hydratedState.currentEpisodeId && state.feeds) {
                let foundEpisode: PodcastEpisode | null = null;
                
                // Search through all feeds to find the episode
                for (const feed of state.feeds) {
                  const episode = feed.episodes.find(ep => ep.id === hydratedState.currentEpisodeId);
                  if (episode) {
                    foundEpisode = episode;
                    break;
                  }
                }
                
                if (foundEpisode) {
                  state.player.currentEpisode = foundEpisode;
                  state.player.currentTime = hydratedState.currentTime || 0;
                }
              }
              
              // Restore episodeProgress
              if (hydratedState.episodeProgress) {
                state.episodeProgress = hydratedState.episodeProgress;
              }
            } catch (error) {
              console.error('Error parsing persisted state:', error);
            }
          }
        }
      },
      skipHydration: true,
    }
  )
); 