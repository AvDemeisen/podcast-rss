import { PodcastEpisode } from '../types/podcast';

export interface AudioError {
  type: 'load' | 'play' | 'network' | 'unknown';
  message: string;
  episodeId?: string;
  originalError?: Error;
}

export const createAudioError = (
  type: AudioError['type'],
  message: string,
  episodeId?: string,
  originalError?: Error
): AudioError => ({
  type,
  message,
  episodeId,
  originalError,
});

export const isAbortError = (error: Error): boolean => {
  return error.name === 'AbortError';
};

export const isNetworkError = (error: Error): boolean => {
  return error.name === 'NetworkError' || 
         error.message.includes('network') ||
         error.message.includes('fetch');
};

export const handleAudioError = (error: Error, episodeId?: string): AudioError => {
  if (isAbortError(error)) {
    return createAudioError('play', 'Playback was interrupted', episodeId, error);
  }
  
  if (isNetworkError(error)) {
    return createAudioError('network', 'Network error occurred', episodeId, error);
  }
  
  if (error.message.includes('load')) {
    return createAudioError('load', 'Failed to load audio', episodeId, error);
  }
  
  return createAudioError('unknown', 'An unexpected error occurred', episodeId, error);
};

export const validateEpisodeForPlayback = (episode: PodcastEpisode): { isValid: boolean; error?: string } => {
  if (!episode) {
    return { isValid: false, error: 'No episode provided' };
  }
  
  if (!episode.audioUrl) {
    return { isValid: false, error: 'Episode has no audio URL' };
  }
  
  if (!episode.audioUrl.trim()) {
    return { isValid: false, error: 'Episode audio URL is empty' };
  }
  
  return { isValid: true };
}; 