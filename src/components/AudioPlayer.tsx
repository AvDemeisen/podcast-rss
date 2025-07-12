'use client';

import { useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Slider,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
} from '@mui/icons-material';
import { usePodcastStore } from '../store/podcastStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useEpisodeManager } from '../hooks/useEpisodeManager';
import { formatTime } from '../utils/formatters';

import styles from './AudioPlayer.module.css';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, audioActions] = useAudioPlayer(audioRef);
  const [, episodeActions] = useEpisodeManager();
  
  const { player, updateCurrentTime } = usePodcastStore();
  const currentEpisode = player.currentEpisode;

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
            {audioState.error && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {audioState.error.message}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
            <IconButton 
              onClick={episodeActions.playPrevious} 
              disabled={episodeActions.getCurrentEpisodeIndex() <= 0 || audioState.isLoading}
              size="small"
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
              ) : player.isPlaying ? (
                <Pause />
              ) : (
                <PlayArrow />
              )}
            </IconButton>
            
            <IconButton 
              onClick={episodeActions.playNext} 
              disabled={episodeActions.getCurrentEpisodeIndex() >= 999 || audioState.isLoading} // TODO: Get actual episode count
              size="small"
            >
              <SkipNext />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Typography variant="caption" sx={{ minWidth: 40 }}>
            {formatTime(player.currentTime)}
          </Typography>
          
          <Slider
            value={player.currentTime}
            max={player.duration || 100}
            onChange={(_, value) => audioActions.handleSeek(value)}
            sx={{ flex: 1, mx: { xs: 0, md: 2 }, minWidth: 0 }}
            disabled={!audioState.isReady || audioState.isLoading}
          />
          
          <Typography variant="caption" sx={{ minWidth: 40 }}>
            {formatTime(player.duration)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
} 