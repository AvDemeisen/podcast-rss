import { useState, useCallback, useMemo } from 'react';
import { PodcastEpisode, PodcastFeed } from '../types/podcast';
import { usePlayer } from '../contexts/PlayerContext';

interface EpisodeState {
  allEpisodes: PodcastEpisode[];
  currentEpisodes: PodcastEpisode[];
  currentPage: number;
  totalPages: number;
}

interface EpisodeActions {
  setCurrentPage: (page: number) => void;
  isCurrentlyPlaying: (episode: PodcastEpisode) => boolean;
  handlePlayEpisode: (episode: PodcastEpisode) => void;
}

export const useEpisodeManager = (episodesPerPage: number, feeds: PodcastFeed[] = []): [EpisodeState, EpisodeActions] => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { playerState, playEpisode } = usePlayer();

  // Combine all episodes from feeds and sort by date
  const allEpisodes = useMemo(() => {
    return feeds
      .flatMap(feed => feed.episodes)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [feeds]);

  // Calculate current episodes to display
  const startIndex = (currentPage - 1) * episodesPerPage;
  const endIndex = startIndex + episodesPerPage;
  const currentEpisodes = allEpisodes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allEpisodes.length / episodesPerPage);

  // Check if episode is currently playing
  const isCurrentlyPlaying = useCallback((episode: PodcastEpisode) => {
    return playerState.currentEpisode?.id === episode.id && playerState.isPlaying;
  }, [playerState.currentEpisode?.id, playerState.isPlaying]);

  // Handle play episode
  const handlePlayEpisode = useCallback((episode: PodcastEpisode) => {
    playEpisode(episode);
  }, [playEpisode]);

  const state: EpisodeState = {
    allEpisodes,
    currentEpisodes,
    currentPage,
    totalPages,
  };

  const actions: EpisodeActions = {
    setCurrentPage,
    isCurrentlyPlaying,
    handlePlayEpisode,
  };

  return [state, actions];
}; 