import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, PodcastEpisode, PlayerState } from '../types/podcast';
import { PODCAST_FEEDS } from '../config/podcasts';

interface PodcastStore extends AppState {
  // Actions
  initializeFeeds: () => Promise<void>;
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
        set((state) => ({
          player: {
            ...state.player,
            currentEpisode: episode,
            isPlaying: true,
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
        set((state) => ({
          player: {
            ...state.player,
            volume,
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
    }),
    {
      name: 'podcast-store',
      partialize: (state) => ({
        feeds: state.feeds,
        player: state.player,
        hiddenEpisodes: Array.from(state.hiddenEpisodes),
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