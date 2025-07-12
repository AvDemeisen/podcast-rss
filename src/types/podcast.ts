export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  pubDate: Date;
  feedTitle: string;
  feedUrl: string;
  imageUrl?: string;
  isPlayed: boolean;
  currentTime: number;
}

export interface PodcastFeed {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
  episodes: PodcastEpisode[];
}

export interface PlayerState {
  currentEpisode: PodcastEpisode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

export interface AppState {
  feeds: PodcastFeed[];
  player: PlayerState;
  hiddenEpisodes: Set<string>;
  episodeProgress: Record<string, number>; // episodeId -> currentTime
  isLoading: boolean;
  error: string | null;
} 