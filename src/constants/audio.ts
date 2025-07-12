export const AUDIO_CONSTANTS = {
  PROGRESS_SAVE_INTERVAL: 10000, // 10 seconds
  DEFAULT_VOLUME: 1,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  VOLUME_STEP: 0.1,
} as const;

export const AUDIO_ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load audio',
  PLAY_FAILED: 'Failed to play audio',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  NO_AUDIO_URL: 'Episode has no audio URL',
  INVALID_EPISODE: 'Invalid episode for playback',
} as const; 