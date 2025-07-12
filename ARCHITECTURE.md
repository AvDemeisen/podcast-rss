# Podcast RSS Player Architecture

This application follows SOLID principles and clean architecture patterns to ensure maintainability, testability, and error tracking.

## Directory Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components (presentation layer)
├── hooks/                  # Custom React hooks (business logic)
├── services/               # External API and data services
├── store/                  # State management (Zustand)
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions and helpers
├── constants/              # Application constants
└── config/                 # Configuration files
```

## Architecture Principles

### 1. Single Responsibility Principle (SRP)
Each module has a single, well-defined responsibility:

- **Components**: Only handle presentation and user interactions
- **Hooks**: Encapsulate business logic and state management
- **Services**: Handle external API calls and data fetching
- **Utils**: Provide pure functions for common operations
- **Store**: Manage global application state

### 2. Open/Closed Principle (OCP)
The codebase is open for extension but closed for modification:

- New podcast feeds can be added via configuration
- New formatting utilities can be added without modifying existing code
- New error types can be handled by extending the error system

### 3. Liskov Substitution Principle (LSP)
Interfaces are designed to be substitutable:

- All hooks return consistent state/actions interfaces
- Services follow common error handling patterns
- Components accept standardized props

### 4. Interface Segregation Principle (ISP)
Interfaces are specific to client needs:

- `AudioPlayerState` and `AudioPlayerActions` are separate
- `EpisodeManagerState` and `EpisodeManagerActions` are separate
- Each hook exposes only the methods it needs

### 5. Dependency Inversion Principle (DIP)
High-level modules don't depend on low-level modules:

- Components depend on hooks, not directly on the store
- Hooks depend on services, not on specific API implementations
- Utils are pure functions with no dependencies

## Key Components

### Hooks Layer
- `useAudioPlayer`: Manages audio playback logic
- `useEpisodeManager`: Handles episode pagination and navigation
- `useFeedManager`: Manages RSS feed loading and error handling

### Services Layer
- `FeedService`: Handles RSS feed fetching and parsing
- Error handling with typed error responses

### Utils Layer
- `formatters.ts`: Date, time, and text formatting
- `validators.ts`: Input validation functions
- `audioHelpers.ts`: Audio-specific utilities and error handling
- `logger.ts`: Centralized logging with error tracking

### Constants
- `audio.ts`: Audio-related constants
- `ui.ts`: UI-related constants

## Error Handling Strategy

### 1. Typed Errors
All errors are typed and categorized:
```typescript
interface AudioError {
  type: 'load' | 'play' | 'network' | 'unknown';
  message: string;
  episodeId?: string;
  originalError?: Error;
}
```

### 2. Error Boundaries
React error boundaries catch component errors:
- `ErrorBoundary` component wraps the entire app
- Graceful fallback UI for unexpected errors
- Development mode shows detailed error information

### 3. Centralized Logging
- `logger.ts` provides consistent logging interface
- Automatic error reporting in production
- In-memory log storage for debugging

### 4. Service-Level Error Handling
- Services return typed error objects
- Network errors are distinguished from parsing errors
- Graceful degradation when individual feeds fail

## State Management

### Zustand Store
- Global state for player, feeds, and user preferences
- Persistence for playback progress and settings
- Hydration-safe with proper SSR handling

### Hook-Based State
- Local component state managed through custom hooks
- Business logic separated from presentation
- Reusable state logic across components

## Benefits of This Architecture

### 1. Easier Error Tracking
- Centralized error handling and logging
- Typed error objects for better debugging
- Error boundaries prevent app crashes

### 2. Better Maintainability
- Clear separation of concerns
- Single responsibility for each module
- Easy to locate and fix issues

### 3. Improved Testability
- Pure utility functions
- Isolated business logic in hooks
- Mockable services for testing

### 4. Enhanced Developer Experience
- TypeScript throughout for better IntelliSense
- Consistent patterns across the codebase
- Clear file organization

### 5. Scalability
- Easy to add new features
- Modular design supports team development
- Configuration-driven for easy customization

## Adding New Features

### 1. New RSS Feed
1. Add to `config/podcasts.ts`
2. No code changes needed - automatically loaded

### 2. New Audio Format
1. Extend `audioHelpers.ts` with format-specific logic
2. Update validation in `validators.ts`
3. Add constants to `constants/audio.ts`

### 3. New UI Component
1. Create in `components/`
2. Use existing hooks for business logic
3. Follow established patterns for props and styling

### 4. New Utility Function
1. Add to appropriate `utils/` file
2. Export with proper TypeScript types
3. Add tests if needed

This architecture makes the application robust, maintainable, and easy to extend while providing excellent error tracking and debugging capabilities. 