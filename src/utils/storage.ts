const STORAGE_KEY = 'podcast-store';

interface StorageData {
  currentEpisodeId: string | null;
  currentTime: number;
  episodeProgress: Record<string, number>;
}

export const storage = {
  get: (): StorageData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      console.log('🔍 localStorage READ:', { key: STORAGE_KEY, data: data ? JSON.parse(data) : null });
      return data ? JSON.parse(data).state : null;
    } catch (error) {
      console.error('❌ localStorage READ ERROR:', error);
      return null;
    }
  },

  set: (data: StorageData): void => {
    try {
      const storageData = { state: data };
      console.log('💾 localStorage WRITE:', { key: STORAGE_KEY, data: storageData });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('❌ localStorage WRITE ERROR:', error);
    }
  },

  remove: (): void => {
    try {
      console.log('🗑️ localStorage REMOVE:', { key: STORAGE_KEY });
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('❌ localStorage REMOVE ERROR:', error);
    }
  },

  clear: (): void => {
    try {
      console.log('🧹 localStorage CLEAR');
      localStorage.clear();
    } catch (error) {
      console.error('❌ localStorage CLEAR ERROR:', error);
    }
  }
}; 