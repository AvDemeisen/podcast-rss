import { Card } from '@mui/material';
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

const PodcastCard: React.FC<PodcastCardProps> = ({ imageUrl, title, selected, onClick, isAll }) => (
  <Card
    className={`${styles.card} ${selected ? styles.selected : ''}`}
    onClick={onClick}
  >
    {isAll ? (
      <div className={`${styles.avatar} ${styles.allButton}`}>
        ALL
      </div>
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
      <div className={styles.avatar}>
        {title.charAt(0)}
      </div>
    )}
    {/* <div className={styles.overlayText}>
      <Typography variant="subtitle2" className={styles.title}>
        {title}
      </Typography>
      <Typography variant="caption" className={styles.episodeCount}>
        {episodeCount} episodes
      </Typography>
    </div> */}
  </Card>
);

export default PodcastCard; 