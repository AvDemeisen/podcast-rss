import { Card, CardContent, Avatar, Box, Typography } from '@mui/material';
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
    sx={{
      width: 180,
      minWidth: 180,
      height: 240,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      cursor: 'pointer',
      border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
      borderRadius: 3,
      boxShadow: 'none',
      transition: 'box-shadow 0.2s',
      '&:hover': {
        boxShadow: 3,
      },
    }}
    onClick={onClick}
  >
    <Box
      sx={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: '#f5f5f5',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {isAll ? (
        <Avatar sx={{ width: 96, height: 96, fontSize: 32 }}>
          All
        </Avatar>
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={180}
          height={180}
          className={styles.image}
          unoptimized
        />
      ) : (
        <Avatar sx={{ width: 96, height: 96, fontSize: 32 }}>
          {title.charAt(0)}
        </Avatar>
      )}
    </Box>
    <CardContent className={styles.cardContent}>
      <Typography variant="subtitle1" className={styles.title}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {episodeCount} episodes
      </Typography>
    </CardContent>
  </Card>
);

export default PodcastCard; 