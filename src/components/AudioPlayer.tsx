'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Slider,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
} from '@mui/icons-material';
import { usePlayer } from '../contexts/PlayerContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils/formatters';

import styles from './AudioPlayer.module.css';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, audioActions] = useAudioPlayer(audioRef);
  
  const { playerState, updateCurrentTime } = usePlayer();
  const currentEpisode = playerState.currentEpisode;

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
        key={currentEpisode.id}
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            updateCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={audioActions.handleLoadedMetadata}
        onCanPlay={audioActions.handleCanPlay}
        onEnded={audioActions.handleEnded}
        onError={audioActions.handleError}
        onAbort={audioActions.handleAbort}
      />
      
      <Box sx={{ p: { xs: 0.5, md: 1 } }}>
        {/* Episode title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, mb: { xs: 0.5, md: 1 } }}>
          {currentEpisode.imageUrl && (
            <Image
              src={currentEpisode.imageUrl}
              alt={currentEpisode.title}
              width={56}
              height={56}
              unoptimized
            />
          )}
          
          <Typography variant="subtitle1" sx={{ flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {currentEpisode.title}
          </Typography>
        </Box>

        {/* Podcast title and controls row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, mb: { xs: 0.5, md: 1 } }}>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
            {currentEpisode.feedTitle}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
            <IconButton 
              size="small"
              disabled={audioState.isLoading}
            >
              <SkipPrevious />
            </IconButton>
            
            <IconButton 
              onClick={audioActions.handlePlayPause} 
              color="primary" 
              size="large"
              disabled={audioState.isLoading || !audioState.isReady}
              sx={{ 
                width: { xs: 40, md: 48 }, 
                height: { xs: 40, md: 48 } 
              }}
            >
              {audioState.isLoading ? (
                <CircularProgress size={20} />
              ) : playerState.isPlaying ? (
                <Pause />
              ) : (
                <PlayArrow />
              )}
            </IconButton>
            
            <IconButton 
              size="small"
              disabled={audioState.isLoading}
            >
              <SkipNext />
            </IconButton>
          </Box>
        </Box>

        {audioState.error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mb: { xs: 0.5, md: 1 } }}>
            {audioState.error.message}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Typography variant="caption" sx={{ minWidth: 40 }}>
            {formatTime(playerState.currentTime)}
          </Typography>
          
          <Slider
            value={playerState.currentTime}
            max={playerState.duration || 100}
            onChange={(_, value) => audioActions.handleSeek(value)}
            sx={{ flex: 1, mx: { xs: 0, md: 2 }, minWidth: 0 }}
            disabled={!audioState.isReady || audioState.isLoading}
          />
          
          <Typography variant="caption" sx={{ minWidth: 40 }}>
            {formatTime(playerState.duration)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
} 