import { Card, Avatar, Typography } from '@mui/material';
import React from 'react';
import Image from 'next/image';
import styles from './PodcastCard.module.css';

interface PodcastCardProps {
  imageUrl?: string;
  title: string;
  episodeCount: number;
  selected?: boolean;
  onClick?: () => void;
  isAll?: boolean;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ imageUrl, title, episodeCount, selected, onClick, isAll }) => (
  <Card
    className={styles.card}
    style={{ border: selected ? '2px solid #1976d2' : '1px solid #333' }}
    onClick={onClick}
  >
    {isAll ? (
      <Avatar className={styles.avatar}>
        All
      </Avatar>
    ) : imageUrl ? (
      <Image
        src={imageUrl}
        alt={title}
        width={175}
        height={175}
        className={styles.image}
        unoptimized
      />
    ) : (
      <Avatar className={styles.avatar}>
        {title.charAt(0)}
      </Avatar>
    )}
    <div className={styles.overlayText}>
      {/* <Typography variant="subtitle2" className={styles.title}>
        {title}
      </Typography> */}
      <Typography variant="caption" className={styles.episodeCount}>
        {episodeCount} episodes
      </Typography>
    </div>
  </Card>
);

export default PodcastCard; 