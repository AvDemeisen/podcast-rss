'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Slider,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import { usePodcastStore } from '../store/podcastStore';

import styles from './AudioPlayer.module.css';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const {
    player,
    feeds,
    setPlayerState,
    pauseEpisode,
    updateCurrentTime,
    setVolume,
    toggleMute,
  } = usePodcastStore();

  const currentEpisode = player.currentEpisode;

  useEffect(() => {
    if (audioRef.current && currentEpisode) {
      // Reset state
      setIsReady(false);
      setAudioError(null);
      
      // Pause current audio before loading new source
      audioRef.current.pause();
      
      // Set new source
      audioRef.current.src = currentEpisode.audioUrl;
      audioRef.current.volume = player.volume;
      audioRef.current.muted = player.isMuted;
      
      // Load the new audio
      audioRef.current.load();
      
      if (player.isPlaying) {
        // Use a small delay to ensure the audio is loaded
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Audio play error:', error);
            setAudioError('Failed to play audio');
            setPlayerState({ isPlaying: false });
          });
        }
      }
    }
  }, [currentEpisode?.audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = player.volume;
      audioRef.current.muted = player.isMuted;
    }
  }, [player.volume, player.isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (player.isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Audio play error:', error);
            setAudioError('Failed to play audio');
            setPlayerState({ isPlaying: false });
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [player.isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (player.isPlaying) {
      pauseEpisode();
    } else {
      setPlayerState({ isPlaying: true });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      updateCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setPlayerState({ duration: audioRef.current.duration });
      setIsReady(true);
      setAudioError(null);
    }
  };

  const handleSeek = (value: number | number[]) => {
    const newTime = Array.isArray(value) ? value[0] : value;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      updateCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentEpisodeIndex = () => {
    if (!currentEpisode) return -1;
    const allEpisodes = feeds.flatMap(feed => feed.episodes);
    return allEpisodes.findIndex(ep => ep.id === currentEpisode.id);
  };

  const playNext = () => {
    const allEpisodes = feeds.flatMap(feed => feed.episodes);
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex < allEpisodes.length - 1) {
      const nextEpisode = allEpisodes[currentIndex + 1];
      usePodcastStore.getState().playEpisode(nextEpisode);
    }
  };

  const playPrevious = () => {
    const allEpisodes = feeds.flatMap(feed => feed.episodes);
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex > 0) {
      const prevEpisode = allEpisodes[currentIndex - 1];
      usePodcastStore.getState().playEpisode(prevEpisode);
    }
  };

  if (!currentEpisode) return null;

  return (
    <Paper
      elevation={8}
      className={styles.audioPlayer}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setPlayerState({ isPlaying: false });
          playNext();
        }}
        onError={() => {
          setAudioError('Failed to load audio');
          setIsReady(false);
        }}
      />
      
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, mb: { xs: 1, md: 2 } }}>
          <Avatar
            src={currentEpisode.imageUrl}
            sx={{ width: { xs: 40, md: 56 }, height: { xs: 40, md: 56 } }}
          >
            {currentEpisode.title.charAt(0)}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {currentEpisode.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {currentEpisode.feedTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentEpisode.pubDate instanceof Date 
                ? currentEpisode.pubDate.toLocaleDateString()
                : new Date(currentEpisode.pubDate).toLocaleDateString()}
            </Typography>
            {audioError && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {audioError}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
            <IconButton 
              onClick={playPrevious} 
              disabled={getCurrentEpisodeIndex() <= 0}
              size="small"
            >
              <SkipPrevious />
            </IconButton>
            
            <IconButton 
              onClick={handlePlayPause} 
              color="primary" 
              size="large"
              sx={{ 
                width: { xs: 40, md: 48 }, 
                height: { xs: 40, md: 48 } 
              }}
            >
              {player.isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            
            <IconButton 
              onClick={playNext} 
              disabled={getCurrentEpisodeIndex() >= feeds.flatMap(f => f.episodes).length - 1}
              size="small"
            >
              <SkipNext />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ minWidth: 40 }}>
            {formatTime(player.currentTime)}
          </Typography>
          
          <Slider
            value={player.currentTime}
            max={player.duration || 100}
            onChange={(_, value) => handleSeek(value)}
            sx={{ flex: 1 }}
            disabled={!isReady}
          />
          
          <Typography variant="caption" sx={{ minWidth: 40 }}>
            {formatTime(player.duration)}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <IconButton onClick={toggleMute} size="small">
              {player.isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            
            <Slider
              value={player.isMuted ? 0 : player.volume}
              max={1}
              step={0.1}
              onChange={(_, value) => handleVolumeChange(value)}
              sx={{ width: 80 }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
} 