/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, Stack, Pagination } from '@mui/material';
import EpisodeCard from './EpisodeCard';
import { PodcastEpisode } from '../types/podcast';

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  filteredEpisodes: PodcastEpisode[];
  currentPage: number;
  totalPages: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  episodeActions: any;
  hiddenEpisodes: Set<string>;
  showEpisode: (id: string) => void;
  hideEpisode: (id: string) => void;
  isCurrentlyPlaying: (ep: PodcastEpisode) => boolean;
  handlePlayEpisode: (ep: PodcastEpisode) => void;
  isValidEpisode: (ep: PodcastEpisode) => boolean;
}

const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  filteredEpisodes,
  currentPage,
  totalPages,
  onPageChange,
  episodeActions,
  hiddenEpisodes,
  showEpisode,
  hideEpisode,
  isCurrentlyPlaying,
  handlePlayEpisode,
  isValidEpisode,
}) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Episodes ({filteredEpisodes.length} total)
    </Typography>
    {episodes.map((episode) => {
      const isHidden = hiddenEpisodes.has(episode.id);
      const isValid = isValidEpisode(episode);
      return (
        <EpisodeCard
          key={episode.id}
          episode={episode}
          isHidden={isHidden}
          isPlaying={isCurrentlyPlaying(episode)}
          isValid={isValid}
          onPlay={() => handlePlayEpisode(episode)}
        />
      );
    })}
    {totalPages > 1 && (
      <Stack spacing={2} alignItems="center" sx={{ mt: 3, mb: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={onPageChange}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
        />
        <Typography variant="body2" color="text.secondary">
          Page {currentPage} of {totalPages}
        </Typography>
      </Stack>
    )}
  </Box>
);

export default EpisodeList; 