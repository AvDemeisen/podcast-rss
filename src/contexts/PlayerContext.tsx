'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { PodcastEpisode, PodcastFeed } from '../types/podcast';
import { usePlayerState } from '../hooks/usePlayerState';

interface PlayerContextType {
  playerState: {
    currentEpisode: PodcastEpisode | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
  };
  episodeProgress: Record<string, number>;
  playEpisode: (episode: PodcastEpisode) => void;
  pauseEpisode: () => void;
  updateCurrentTime: (time: number) => void;
  saveEpisodeProgress: (episodeId: string, currentTime: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setDuration: (duration: number) => void;
  resetPlayer: () => void;
  restoreEpisodeFromFeeds: (feeds: PodcastFeed[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const playerState = usePlayerState();

  return (
    <PlayerContext.Provider value={playerState}>
      {children}
    </PlayerContext.Provider>
  );
}; 