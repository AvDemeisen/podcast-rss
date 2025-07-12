import { useState, useMemo } from 'react';
import { usePodcastStore } from '../store/podcastStore';
import { PodcastEpisode } from '../types/podcast';
import { isValidEpisode } from '../utils/validators';

export interface EpisodeManagerState {
  currentPage: number;
  episodesPerPage: number;
  totalPages: number;
  currentEpisodes: PodcastEpisode[];
  allEpisodes: PodcastEpisode[];
}

export interface EpisodeManagerActions {
  setCurrentPage: (page: number) => void;
  getCurrentEpisodeIndex: () => number;
  playNext: () => void;
  playPrevious: () => void;
  handlePlayEpisode: (episode: PodcastEpisode) => void;
  isCurrentlyPlaying: (episode: PodcastEpisode) => boolean;
}

export const useEpisodeManager = (episodesPerPage: number = 10): [EpisodeManagerState, EpisodeManagerActions] => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    feeds,
    player,
    playEpisode,
    markEpisodeAsPlayed,
  } = usePodcastStore();

  // Combine all episodes and sort by date
  const allEpisodes = useMemo(() => {
    return feeds
      .flatMap(feed => feed.episodes)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [feeds]);

  // Pagination logic
  const totalPages = Math.ceil(allEpisodes.length / episodesPerPage);
  const startIndex = (currentPage - 1) * episodesPerPage;
  const endIndex = startIndex + episodesPerPage;
  const currentEpisodes = allEpisodes.slice(startIndex, endIndex);

  const getCurrentEpisodeIndex = (): number => {
    if (!player.currentEpisode) return -1;
    return allEpisodes.findIndex(ep => ep.id === player.currentEpisode!.id);
  };

  const playNext = (): void => {
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex < allEpisodes.length - 1) {
      const nextEpisode = allEpisodes[currentIndex + 1];
      if (isValidEpisode(nextEpisode)) {
        playEpisode(nextEpisode);
        markEpisodeAsPlayed(nextEpisode.id);
      }
    }
  };

  const playPrevious = (): void => {
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex > 0) {
      const prevEpisode = allEpisodes[currentIndex - 1];
      if (isValidEpisode(prevEpisode)) {
        playEpisode(prevEpisode);
        markEpisodeAsPlayed(prevEpisode.id);
      }
    }
  };

  const handlePlayEpisode = (episode: PodcastEpisode): void => {
    if (!isValidEpisode(episode)) {
      console.error('Invalid episode for playback:', episode);
      return;
    }
    playEpisode(episode);
    markEpisodeAsPlayed(episode.id);
  };

  const isCurrentlyPlaying = (episode: PodcastEpisode): boolean => {
    return player.currentEpisode?.id === episode.id && player.isPlaying;
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const state: EpisodeManagerState = {
    currentPage,
    episodesPerPage,
    totalPages,
    currentEpisodes,
    allEpisodes,
  };

  const actions: EpisodeManagerActions = {
    setCurrentPage: handlePageChange,
    getCurrentEpisodeIndex,
    playNext,
    playPrevious,
    handlePlayEpisode,
    isCurrentlyPlaying,
  };

  return [state, actions];
}; 