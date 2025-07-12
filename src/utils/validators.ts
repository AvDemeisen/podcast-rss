import { PodcastEpisode } from '../types/podcast';

export const isValidEpisode = (episode: PodcastEpisode): boolean => {
  return !!(
    episode &&
    episode.id &&
    episode.title &&
    episode.audioUrl &&
    episode.audioUrl.trim() !== ''
  );
};

export const isValidTime = (time: number): boolean => {
  return typeof time === 'number' && time >= 0 && !isNaN(time);
};

export const isValidVolume = (volume: number): boolean => {
  return typeof volume === 'number' && volume >= 0 && volume <= 1;
};

export const isValidEpisodeId = (episodeId: string): boolean => {
  return typeof episodeId === 'string' && episodeId.trim() !== '';
};

export const isValidProgressData = (episodeId: string, currentTime: number): boolean => {
  return isValidEpisodeId(episodeId) && isValidTime(currentTime);
}; 