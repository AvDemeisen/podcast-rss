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
      partialize: (state) => ({
        feeds: state.feeds,
        player: state.player,
        hiddenEpisodes: Array.from(state.hiddenEpisodes),
        episodeProgress: state.episodeProgress,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hiddenEpisodes = new Set(state.hiddenEpisodes);
        }
      },
      skipHydration: true,
    }
  )
); 