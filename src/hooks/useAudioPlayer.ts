/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, RefObject } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
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
    playerState,
    episodeProgress,
    playEpisode,
    pauseEpisode,
    updateCurrentTime,
    setVolume,
    saveEpisodeProgress,
    setDuration,
  } = usePlayer();

  const currentEpisode = playerState.currentEpisode;

  // Handle episode change
  useEffect(() => {
    console.log('🎧 Audio player: episode changed', {
      episodeId: currentEpisode?.id,
      episodeTitle: currentEpisode?.title,
      audioUrl: currentEpisode?.audioUrl,
    });
    
    if (!currentEpisode) {
      setIsReady(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      console.log('🎧 Audio player: no audio ref');
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

    console.log('🎧 Audio player: loading episode', currentEpisode.title);

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
    audio.volume = playerState.volume;
    audio.muted = playerState.isMuted;

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
  }, [currentEpisode?.id, currentEpisode?.audioUrl, playerState.volume, playerState.isMuted, episodeProgress, updateCurrentTime, audioRef]);

  // Handle volume/mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = playerState.volume;
      audioRef.current.muted = playerState.isMuted;
    }
  }, [playerState.volume, playerState.isMuted, audioRef]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady || isLoading) return;

    if (playerState.isPlaying) {
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
          // We need to update the player state to reflect the pause
          pauseEpisode();
        }
      });
    } else {
      audio.pause();
      // Cancel any ongoing play attempt
      if (playAttemptRef.current) {
        playAttemptRef.current = Promise.resolve();
      }
    }
  }, [playerState.isPlaying, isReady, isLoading, pauseEpisode, currentEpisode?.id, audioRef]);

  // Save progress every few seconds while playing
  useEffect(() => {
    if (!playerState.isPlaying || !currentEpisode) return;

    const interval = setInterval(() => {
      if (audioRef.current && playerState.currentTime > 0) {
        saveEpisodeProgress(currentEpisode.id, playerState.currentTime);
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [playerState.isPlaying, currentEpisode, playerState.currentTime, saveEpisodeProgress]);

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
    console.log('🎧 handlePlayPause called', {
      isLoading,
      isReady,
      isPlaying: playerState.isPlaying,
      currentEpisode: currentEpisode?.title,
    });
    
    if (isLoading || !isReady) return;
    
    if (playerState.isPlaying) {
      if (currentEpisode) {
        saveEpisodeProgress(currentEpisode.id, playerState.currentTime);
      }
      pauseEpisode();
    } else {
      // We need to update the player state to reflect play
      // This will be handled by the playEpisode function
      if (currentEpisode) {
        playEpisode(currentEpisode);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
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
    pauseEpisode();
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