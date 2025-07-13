import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { PodcastEpisode } from '../types/podcast';
import { formatDuration, formatDate, truncateText } from '../utils/formatters';
import { UI_CONSTANTS } from '../constants/ui';
import styles from './EpisodeCard.module.css';

interface EpisodeCardProps {
  episode: PodcastEpisode;
  isHidden: boolean;
  isPlaying: boolean;
  isValid: boolean;
  onPlay: () => void;
}

const getStatus = (isPlayed: boolean, isPlaying: boolean) => {
  if (isPlaying) return 'playing';
  if (isPlayed) return 'resume';
  return 'unplayed';
};

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, isHidden, isPlaying, isValid, onPlay }) => (
  <Card
    className={styles.episodeCard}
    sx={{
      mb: 2,
      opacity: isHidden ? 0.5 : 1,
      transition: 'opacity 0.2s ease-in-out',
      cursor: isValid && !isHidden ? 'pointer' : 'default',
    }}
    onClick={() => {
      if (isValid && !isHidden) onPlay();
    }}
    tabIndex={0}
    role="button"
    aria-label={`Play episode: ${episode.title}`}
  >
    <CardContent className={styles.cardContent}>
      <div className={styles.imageWrapper}>
        <img
          src={episode.imageUrl}
          alt={episode.feedTitle}
          className={styles.episodeImage}
        />
        <div className={styles.playOverlay}>
          {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
        </div>
      </div>
      <div className={styles.textBlock}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5, color: isPlaying ? 'primary.main' : 'text.secondary', mr: 1 }}
          >
            {getStatus(!!episode.isPlayed, isPlaying)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(episode.pubDate)}
          </Typography>
        </Box>
        <Typography
          variant="subtitle2"
          sx={{ flex: 1, fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 500 }}
        >
          {episode.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5, fontSize: { xs: '0.8rem', md: '0.95rem' } }}
        >
          {episode.feedTitle} • {formatDuration(episode.duration)}
          {!isValid && (
            <span style={{ color: '#f44336', marginLeft: '8px' }}>
              (No audio available)
            </span>
          )}
        </Typography>
        <Typography
          variant="body2"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {truncateText(episode.description, UI_CONSTANTS.DESCRIPTION_MAX_LENGTH)}
        </Typography>
      </div>
    </CardContent>
  </Card>
);

export default EpisodeCard; 