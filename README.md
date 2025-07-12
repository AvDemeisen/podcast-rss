# Podcast RSS Player

A web app that combines multiple podcast RSS feeds into a single, unified player with persistent state management.

## Features

- **RSS Feed Integration**: Add multiple podcast RSS feeds
- **Unified Feed**: Combined episodes sorted by date
- **Persistent Player**: Audio player that stays at the bottom while browsing
- **State Management**: Saves playback progress and episode status
- **Material Design**: Modern UI using Google Material Components
- **Episode Management**: Hide episodes you don't want to see
- **Playback Controls**: Play, pause, skip, volume control, and mute

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your RSS feeds by editing `src/config/podcasts.ts`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

Edit `src/config/podcasts.ts` to add or modify your RSS feeds:

```typescript
export const PODCAST_FEEDS = [
  {
    name: 'Your Podcast Name',
    url: 'https://feeds.example.com/your-podcast',
    description: 'Description of your podcast'
  }
];
```

## Pre-configured Feeds

The app comes with these feeds pre-configured:

- Blindboy Podcast: `https://feeds.acast.com/public/shows/blindboy`
- Here Comes The Guillotine: `https://feeds.captivate.fm/here-comes-the-guillotine/`

## How to Use

1. **Browse Episodes**: All episodes from all configured feeds are combined and sorted by date
2. **Play Episodes**: Click the play button on any episode
3. **Control Playback**: Use the persistent player at the bottom
4. **Hide Episodes**: Click the eye icon to hide episodes you don't want to see
5. **Track Progress**: The app remembers which episodes you've played

## Tech Stack

- **Next.js 15**: React framework with App Router
- **Material-UI**: Google Material Design components
- **Zustand**: Lightweight state management with persistence
- **RSS Parser**: Parse podcast RSS feeds
- **TypeScript**: Type safety throughout the app

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## State Persistence

The app automatically saves:
- Added RSS feeds
- Playback progress
- Episode play status
- Hidden episodes
- Volume and mute settings

Data is stored in the browser's local storage and persists between sessions.
