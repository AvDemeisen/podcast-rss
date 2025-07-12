'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VisibilityOff,
  Visibility,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { usePodcastStore } from '../store/podcastStore';
import { PodcastEpisode } from '../types/podcast';
import AudioPlayer from '../components/AudioPlayer';
import styles from './page.module.css';

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    feeds,
    player,
    hiddenEpisodes,
    isLoading,
    error,
    initializeFeeds,
    playEpisode,
    hideEpisode,
    showEpisode,
    markEpisodeAsPlayed,
  } = usePodcastStore();

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize feeds on component mount after hydration
  useEffect(() => {
    if (isHydrated && feeds.length === 0) {
      initializeFeeds();
    }
  }, [isHydrated, feeds.length, initializeFeeds]);

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <Container maxWidth="md" className={styles.container}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Combine all episodes and sort by date
  const allEpisodes = feeds
    .flatMap(feed => feed.episodes)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Unknown date';
      }
      return format(dateObj, 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const handlePlayEpisode = (episode: PodcastEpisode) => {
    playEpisode(episode);
    markEpisodeAsPlayed(episode.id);
  };

  const isCurrentlyPlaying = (episode: PodcastEpisode) => {
    return player.currentEpisode?.id === episode.id && player.isPlaying;
  };

  return (
    <Container maxWidth="md" className={styles.container}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Podcast RSS Player
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {feeds.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {feeds.length} feed{feeds.length !== 1 ? 's' : ''} • {allEpisodes.length} episodes
          </Typography>
        )}

        {feeds.length > 0 && (
          <Box sx={{ mb: 3, display: { xs: 'none', md: 'block' } }}>
            <Typography variant="h6" gutterBottom>
              Feeds
            </Typography>
            {feeds.map((feed) => (
              <Card key={feed.url} sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {feed.imageUrl && (
                      <Avatar src={feed.imageUrl} sx={{ width: 32, height: 32 }}>
                        {feed.title.charAt(0)}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="subtitle2">{feed.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {feed.episodes.length} episodes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {allEpisodes.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Episodes
            </Typography>
            {allEpisodes.map((episode) => {
              const isHidden = hiddenEpisodes.has(episode.id);
              return (
                <Card 
                  key={episode.id} 
                  sx={{ 
                    mb: 1,
                    opacity: isHidden ? 0.5 : 1,
                    transition: 'opacity 0.2s ease-in-out'
                  }}
                >
                  <CardContent sx={{ py: { xs: 1, md: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, md: 2 } }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            flex: 1,
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}
                        >
                          {episode.title}
                        </Typography>
                        {episode.isPlayed ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <RadioButtonUnchecked color="disabled" fontSize="small" />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1,
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }}
                      >
                        {episode.feedTitle} • {formatDate(episode.pubDate)} • {formatDuration(episode.duration)}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 1,
                          display: { xs: 'none', md: 'block' } // Hide on mobile
                        }}
                      >
                        {episode.description.length > 150
                          ? `${episode.description.substring(0, 150)}...`
                          : episode.description}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton
                        onClick={() => handlePlayEpisode(episode)}
                        color={isCurrentlyPlaying(episode) ? 'primary' : 'default'}
                        disabled={isHidden}
                      >
                        {isCurrentlyPlaying(episode) ? <Pause /> : <PlayArrow />}
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={() => isHidden ? showEpisode(episode.id) : hideEpisode(episode.id)}
                        color={isHidden ? 'primary' : 'default'}
                      >
                        {isHidden ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
            })}
          </Box>
        )}

        {feeds.length === 0 && !isLoading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No podcasts yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loading your configured podcast feeds...
            </Typography>
          </Box>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Audio Player */}
      {player.currentEpisode && (
        <AudioPlayer />
      )}
    </Container>
  );
}
