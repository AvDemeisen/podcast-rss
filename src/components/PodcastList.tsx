import React from 'react';
import { Box, Typography } from '@mui/material';
import PodcastCard from './PodcastCard';

interface PodcastListProps {
  podcasts: Array<{ title: string; imageUrl?: string; episodeCount: number }>;
  selectedPodcast: string | null;
  onSelect: (title: string | null) => void;
  allCount: number;
}

const PodcastList: React.FC<PodcastListProps> = ({ podcasts, selectedPodcast, onSelect, allCount }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom>
      Podcasts
    </Typography>
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
      <PodcastCard
        title="All Podcasts"
        episodeCount={allCount}
        selected={selectedPodcast === null}
        onClick={() => onSelect(null)}
        isAll
      />
      {podcasts.map((podcast) => (
        <PodcastCard
          key={podcast.title}
          title={podcast.title}
          imageUrl={podcast.imageUrl}
          episodeCount={podcast.episodeCount}
          selected={selectedPodcast === podcast.title}
          onClick={() => onSelect(podcast.title)}
        />
      ))}
    </Box>
  </Box>
);

export default PodcastList; 