import React from 'react';
import { Card, CardContent, Avatar, Box, Typography, IconButton } from '@mui/material';
import { PlayArrow, Pause, VisibilityOff, Visibility, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
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
  onHideToggle: () => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, isHidden, isPlaying, isValid, onPlay, onHideToggle }) => (
  <Card
    sx={{
      mb: 2,
      opacity: isHidden ? 0.5 : 1,
      transition: 'opacity 0.2s ease-in-out',
    }}
  >
    <CardContent className={styles.cardContent}>
      <Avatar
        src={episode.imageUrl}
        className={styles.avatar}
      >
        {episode.feedTitle.charAt(0)}
      </Avatar>
      <div className={styles.textBlock}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ flex: 1, fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 500 }}
          >
            {episode.title}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5, fontSize: { xs: '0.8rem', md: '0.95rem' } }}
        >
          {episode.feedTitle} • {formatDate(episode.pubDate)} • {formatDuration(episode.duration)}
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
      <div className={styles.iconRow}>
        <IconButton
          onClick={onPlay}
          color={isPlaying ? 'primary' : 'default'}
          disabled={isHidden || !isValid}
          className={styles.playButton}
        >
          {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
        </IconButton>
 
        <div         className={styles.iconColumn}>
        {episode.isPlayed ? (
          <CheckCircle color="success" fontSize="medium" />
        ) : (
          <RadioButtonUnchecked color="disabled" fontSize="medium" />
        )}
        <IconButton
          size="small"
          onClick={onHideToggle}
          color={isHidden ? 'primary' : 'default'}
        >
          {isHidden ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
        </IconButton>
        </div>

      </div>
    </CardContent>
  </Card>
);

export default EpisodeCard; 