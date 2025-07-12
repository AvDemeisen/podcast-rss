/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, RefObject } from 'react';
import { usePodcastStore } from '../store/podcastStore';
import { 
  handleAudioError, 
  validateEpisodeForPlayback,
  AudioError 
} from '../utils/audioHelpers';
import { isValidTime } from '../utils/validators';

export interface AudioPlayerState {
  isLoading: boolean;
  isReady: boolean;
  error: AudioError | null;
}

export interface AudioPlayerActions {
  handlePlayPause: () => void;
  handleSeek: (value: number | number[]) => void;
  handleVolumeChange: (value: number | number[]) => void;
  handleLoadedMetadata: () => void;
  handleCanPlay: () => void;
  handleEnded: () => void;
  handleError: () => void;
  handleAbort: () => void;
}

export const useAudioPlayer = (audioRef: RefObject<HTMLAudioElement | null>): [AudioPlayerState, AudioPlayerActions] => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<AudioError | null>(null);
  const lastSaveTimeRef = useRef(0);
  const playAttemptRef = useRef<Promise<void> | null>(null);

  const {
    player,
    episodeProgress,
    setPlayerState,
    pauseEpisode,
    updateCurrentTime,
    setVolume,
    saveEpisodeProgress,
  } = usePodcastStore();

  const currentEpisode = player.currentEpisode;

  // Handle episode change
  useEffect(() => {
    if (!currentEpisode) {
      setIsReady(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    // Validate episode before loading
    const validation = validateEpisodeForPlayback(currentEpisode);
    if (!validation.isValid) {
      console.error('useAudioPlayer: episode validation failed:', validation.error);
      setError(handleAudioError(new Error(validation.error!), currentEpisode.id));
      setIsReady(false);
      setIsLoading(false);
      return;
    }

    // Reset state
    setIsReady(false);
    setError(null);
    setIsLoading(true);
    lastSaveTimeRef.current = 0;

    // Cancel any ongoing play attempt
    if (playAttemptRef.current) {
      playAttemptRef.current = Promise.resolve();
    }

    // Pause and reset audio
    audio.pause();
    audio.currentTime = 0;
    audio.src = currentEpisode.audioUrl;
    audio.volume = player.volume;
    audio.muted = player.isMuted;

    // Load the new audio
    audio.load();

    // Restore saved progress for this episode
    const savedProgress = episodeProgress[currentEpisode.id];
    if (savedProgress && isValidTime(savedProgress)) {
      audio.currentTime = savedProgress;
      updateCurrentTime(savedProgress);
    }

    if ('mediaSession' in navigator && currentEpisode) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentEpisode.title,
        artist: currentEpisode.feedTitle,
        album: currentEpisode.feedTitle,
        artwork: [
          { src: currentEpisode.imageUrl ?? '', sizes: '512x512', type: 'image/png' }
        ]
      });
    }
  }, [currentEpisode?.id, currentEpisode?.audioUrl, player.volume, player.isMuted, episodeProgress, updateCurrentTime, audioRef]);

  // Handle volume/mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = player.volume;
      audioRef.current.muted = player.isMuted;
    }
  }, [player.volume, player.isMuted, audioRef]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady || isLoading) return;

    if (player.isPlaying) {
      // Cancel any existing play attempt
      if (playAttemptRef.current) {
        playAttemptRef.current = Promise.resolve();
      }

      // Start new play attempt
      playAttemptRef.current = audio.play().catch((error) => {
        console.log('Audio play error:', error);
        const audioError = handleAudioError(error, currentEpisode?.id);
        if (audioError.type !== 'play') { // Don't show abort errors
          setError(audioError);
          setPlayerState({ isPlaying: false });
        }
      });
    } else {
      audio.pause();
      // Cancel any ongoing play attempt
      if (playAttemptRef.current) {
        playAttemptRef.current = Promise.resolve();
      }
    }
  }, [player.isPlaying, isReady, isLoading, setPlayerState, currentEpisode?.id, audioRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (playAttemptRef.current) {
        playAttemptRef.current = Promise.resolve();
      }
    };
  }, [audioRef]);

  const handlePlayPause = () => {
    if (isLoading || !isReady) return;
    
    if (player.isPlaying) {
      if (currentEpisode) {
        saveEpisodeProgress(currentEpisode.id, player.currentTime);
      }
      pauseEpisode();
    } else {
      setPlayerState({ isPlaying: true });
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setPlayerState({ duration: audioRef.current.duration });
      setIsReady(true);
      setError(null);
      setIsLoading(false);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleSeek = (value: number | number[]) => {
    const newTime = Array.isArray(value) ? value[0] : value;
    if (audioRef.current && isValidTime(newTime)) {
      audioRef.current.currentTime = newTime;
      updateCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);
  };

  const handleEnded = () => {
    if (currentEpisode) {
      saveEpisodeProgress(currentEpisode.id, 0); // Reset progress when finished
    }
    setPlayerState({ isPlaying: false });
    // Auto-play next episode logic would go here
  };

  const handleError = () => {
    const audioError = handleAudioError(new Error('Failed to load audio'), currentEpisode?.id);
    setError(audioError);
    setIsReady(false);
    setIsLoading(false);
  };

  const handleAbort = () => {
    // Handle abort gracefully - don't show error for user-initiated aborts
    setIsLoading(false);
  };

  const state: AudioPlayerState = {
    isLoading,
    isReady,
    error,
  };

  const actions: AudioPlayerActions = {
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    handleLoadedMetadata,
    handleCanPlay,
    handleEnded,
    handleError,
    handleAbort,
  };

  return [state, actions];
}; 