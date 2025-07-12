'use client';

import { useState } from 'react';
import Head from 'next/head';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { usePodcastStore } from '../store/podcastStore';
import { useFeedManager } from '../hooks/useFeedManager';
import { useEpisodeManager } from '../hooks/useEpisodeManager';
import { isValidEpisode } from '../utils/validators';
import { UI_CONSTANTS } from '../constants/ui';
import AudioPlayer from '../components/AudioPlayer';
import styles from './page.module.css';
import PodcastList from '../components/PodcastList';
import EpisodeList from '../components/EpisodeList';

export default function Home() {
  const [feedState, feedActions] = useFeedManager();
  const [episodeState, episodeActions] = useEpisodeManager(UI_CONSTANTS.EPISODES_PER_PAGE);
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);
  
  const { hiddenEpisodes, hideEpisode, showEpisode, player } = usePodcastStore();
  const currentEpisode = player.currentEpisode;
  const isPlaying = player.isPlaying && currentEpisode;

  // Get unique podcasts from episodes
  const podcasts = episodeState.allEpisodes
    .reduce((acc, episode) => {
      const existingPodcast = acc.find(p => p.title === episode.feedTitle);
      if (!existingPodcast) {
        acc.push({
          title: episode.feedTitle,
          url: episode.feedUrl,
          imageUrl: episode.imageUrl,
          episodeCount: episodeState.allEpisodes.filter(ep => ep.feedTitle === episode.feedTitle).length,
        });
      }
      return acc;
    }, [] as Array<{ title: string; url: string; imageUrl?: string; episodeCount: number }>);

  // Filter episodes based on selected podcast
  const filteredEpisodes = selectedPodcast 
    ? episodeState.allEpisodes.filter(episode => episode.feedTitle === selectedPodcast)
    : episodeState.allEpisodes;

  // Update episode manager with filtered episodes
  const displayEpisodes = selectedPodcast 
    ? filteredEpisodes.slice((episodeState.currentPage - 1) * UI_CONSTANTS.EPISODES_PER_PAGE, episodeState.currentPage * UI_CONSTANTS.EPISODES_PER_PAGE)
    : episodeState.currentEpisodes;

  const totalPages = Math.ceil(filteredEpisodes.length / UI_CONSTANTS.EPISODES_PER_PAGE);

  const handlePodcastSelect = (podcastTitle: string | null) => {
    setSelectedPodcast(podcastTitle);
    episodeActions.setCurrentPage(1); // Reset to first page when filtering
  };

  // Don't render until hydrated to prevent mismatch
  if (!feedState.isLoading && episodeState.allEpisodes.length === 0) {
    return (
      <Container maxWidth="md" className={styles.container}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    episodeActions.setCurrentPage(page);
  };

  return (
    <>
      <Head>
        <title>
          {isPlaying ? `${currentEpisode.title} | ${currentEpisode.feedTitle}` : 'Podcast RSS Player'}
        </title>
        {isPlaying && currentEpisode.imageUrl && (
          <meta property="og:image" content={currentEpisode.imageUrl} />
        )}
        {isPlaying && (
          <meta name="description" content={currentEpisode.title} />
        )}
      </Head>
      <Container maxWidth="md" className={styles.container}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Podcast RSS Player
          </Typography>
          
          {feedState.error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={feedActions.retryLoad}
                >
                  Retry
                </IconButton>
              }
            >
              {feedState.error}
            </Alert>
          )}

          {feedState.feedsCount > 0 && (
            <PodcastList
              podcasts={podcasts}
              selectedPodcast={selectedPodcast}
              onSelect={handlePodcastSelect}
              allCount={episodeState.allEpisodes.length}
            />
          )}

          {displayEpisodes.length > 0 && (
            <EpisodeList
              episodes={displayEpisodes}
              filteredEpisodes={filteredEpisodes}
              currentPage={episodeState.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              episodeActions={episodeActions}
              hiddenEpisodes={hiddenEpisodes}
              showEpisode={showEpisode}
              hideEpisode={hideEpisode}
              isCurrentlyPlaying={episodeActions.isCurrentlyPlaying}
              handlePlayEpisode={episodeActions.handlePlayEpisode}
              isValidEpisode={isValidEpisode}
            />
          )}

          {feedState.feedsCount === 0 && !feedState.isLoading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No podcasts yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading your configured podcast feeds...
              </Typography>
            </Box>
          )}

          {feedState.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>

        {/* Audio Player */}
        <AudioPlayer />
      </Container>
    </>
  );
}
