import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, PodcastEpisode, PlayerState } from '../types/podcast';
import { PODCAST_FEEDS } from '../config/podcasts';
import { storage } from '../utils/storage';

interface PodcastStore extends AppState {
  // Internal state for rehydration
  _savedEpisodeData?: {
    currentEpisodeId: string | null;
    currentTime: number;
  };
  
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
  saveToStorage: () => void;
}

export const usePodcastStore = create<PodcastStore>()(
  persist(
    (set, get) => {
      // Log initial state on store creation
      console.log('🏗️ Creating Zustand store...');
      
      return {
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
        hiddenEpisodes: new Set<string>(),
        episodeProgress: {},
        isLoading: false,
        error: null,
        _savedEpisodeData: undefined,

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
            
            // After feeds are loaded, try to restore the saved episode
            const state = get();
            if (state._savedEpisodeData && state._savedEpisodeData.currentEpisodeId) {
              console.log('🔍 Looking for saved episode:', state._savedEpisodeData.currentEpisodeId);
              
              let foundEpisode: PodcastEpisode | null = null;
              
              // Search through all feeds to find the episode
              for (const feed of feeds) {
                const episode = feed.episodes.find((ep: PodcastEpisode) => ep.id === state._savedEpisodeData!.currentEpisodeId);
                if (episode) {
                  foundEpisode = episode;
                  break;
                }
              }
              
              if (foundEpisode) {
                set(() => ({
                  player: {
                    ...get().player,
                    currentEpisode: foundEpisode,
                    currentTime: state._savedEpisodeData!.currentTime || 0,
                  },
                  _savedEpisodeData: undefined, // Clear the saved data
                }));
                console.log('✅ Restored episode:', foundEpisode.title, 'at time:', state._savedEpisodeData.currentTime);
              } else {
                console.log('❌ Episode not found in feeds:', state._savedEpisodeData.currentEpisodeId);
                // Clear the saved data since we couldn't find the episode
                set(() => ({
                  _savedEpisodeData: undefined,
                }));
              }
            }
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
          
          // Log localStorage after state update
          setTimeout(() => {
            console.log('🎵 Play episode - localStorage state:', storage.get());
          }, 100);
        },

        pauseEpisode: () => {
          set((state) => ({
            player: {
              ...state.player,
              isPlaying: false,
            },
          }));
          
          // Log localStorage after state update
          setTimeout(() => {
            console.log('⏸️ Pause episode - localStorage state:', storage.get());
          }, 100);
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

        saveToStorage: () => {
          storage.set({
            currentEpisodeId: get().player.currentEpisode?.id || null,
            currentTime: get().player.currentTime,
            episodeProgress: get().episodeProgress,
          });
        },
      };
    },
    {
      name: 'podcast-store',
      partialize: (state) => ({
        // Only persist minimal data: current episode ID and timestamp
        currentEpisodeId: state.player.currentEpisode?.id || null,
        currentTime: state.player.currentTime,
        episodeProgress: state.episodeProgress,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Log the rehydration process using our storage utility
          console.log('🔄 Rehydrating store...');
          const hydratedState = storage.get();
          
          if (hydratedState) {
            // Immediately update the state with localStorage data
            state.player.currentTime = hydratedState.currentTime || 0;
            state.episodeProgress = hydratedState.episodeProgress || {};
            
            // Store the saved episode data for later restoration
            state._savedEpisodeData = {
              currentEpisodeId: hydratedState.currentEpisodeId,
              currentTime: hydratedState.currentTime,
            };
            
            console.log('✅ Immediately restored currentTime and episodeProgress');
            console.log('📋 Saved episode data for later restoration:', state._savedEpisodeData);
          } else {
            console.log('ℹ️ No persisted state found');
          }
        }
      },
      skipHydration: true,
    }
  )
); 