/**
 * StorageService - AsyncStorage wrapper with error handling and retry logic
 * 
 * Provides persistent storage for plant data, care history, badges, and other app data.
 * Implements retry logic for failed writes and handles storage quota errors gracefully.
 * 
 * Requirements: 2.1-2.9, 17.1-17.3, 17.7
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Plant,
  CareAction,
  Badge,
  HealthSnapshot,
  ChatMessage,
  WeatherData,
  StorageService,
  STORAGE_KEYS,
} from '../types';

// Constants for retry logic
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 500;

/**
 * Storage error codes
 */
const STORAGE_ERROR_CODES = {
  QUOTA_EXCEEDED: 'QuotaExceededError',
  PARSE_ERROR: 'ParseError',
  WRITE_ERROR: 'WriteError',
  READ_ERROR: 'ReadError',
} as const;

/**
 * Helper function to delay execution
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function to safely parse JSON with error handling
 */
const safeParse = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed ?? defaultValue;
  } catch (error) {
    console.error('[StorageService] JSON parse error:', error);
    return defaultValue;
  }
};

/**
 * Helper function to safely stringify JSON
 */
const safeStringify = (data: any): string | null => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('[StorageService] JSON stringify error:', error);
    return null;
  }
};

/**
 * Check if error is a quota exceeded error
 */
const isQuotaExceededError = (error: any): boolean => {
  return (
    error?.name === STORAGE_ERROR_CODES.QUOTA_EXCEEDED ||
    error?.message?.toLowerCase().includes('quota') ||
    error?.message?.toLowerCase().includes('storage full')
  );
};

/**
 * Generic read function with error handling
 */
const readFromStorage = async <T>(
  key: string,
  defaultValue: T
): Promise<T> => {
  try {
    const jsonString = await AsyncStorage.getItem(key);
    return safeParse(jsonString, defaultValue);
  } catch (error) {
    console.error(`[StorageService] Failed to read ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Generic write function with retry logic and error handling
 */
const writeToStorage = async (
  key: string,
  data: any,
  retryCount = 0
): Promise<void> => {
  try {
    const jsonString = safeStringify(data);
    
    if (jsonString === null) {
      throw new Error('Failed to serialize data');
    }

    await AsyncStorage.setItem(key, jsonString);
  } catch (error) {
    // Check for quota exceeded error
    if (isQuotaExceededError(error)) {
      console.error('[StorageService] Storage quota exceeded:', error);
      throw new Error(
        'Storage full - please delete old plants or care history'
      );
    }

    // Retry logic for other errors
    if (retryCount < MAX_RETRIES) {
      console.warn(
        `[StorageService] Write failed for ${key}, retrying... (${retryCount + 1}/${MAX_RETRIES})`
      );
      await delay(RETRY_DELAY_MS);
      return writeToStorage(key, data, retryCount + 1);
    }

    // Max retries reached
    console.error(`[StorageService] Failed to write ${key} after ${MAX_RETRIES} retries:`, error);
    throw new Error('Failed to save data');
  }
};

/**
 * StorageService implementation
 */
export const storageService: StorageService = {
  /**
   * Get all plants from storage
   * Returns empty array if read fails
   */
  async getPlants(): Promise<Plant[]> {
    return readFromStorage<Plant[]>(STORAGE_KEYS.PLANTS, []);
  },

  /**
   * Save plants to storage
   * Retries once on failure
   * Throws error if quota exceeded or max retries reached
   */
  async savePlants(plants: Plant[]): Promise<void> {
    return writeToStorage(STORAGE_KEYS.PLANTS, plants);
  },

  /**
   * Get care history from storage
   * Returns empty array if read fails
   */
  async getCareHistory(): Promise<CareAction[]> {
    return readFromStorage<CareAction[]>(STORAGE_KEYS.CARE_HISTORY, []);
  },

  /**
   * Save care history to storage
   * Retries once on failure
   * Throws error if quota exceeded or max retries reached
   */
  async saveCareHistory(history: CareAction[]): Promise<void> {
    return writeToStorage(STORAGE_KEYS.CARE_HISTORY, history);
  },

  /**
   * Get badges from storage
   * Returns empty array if read fails
   */
  async getBadges(): Promise<Badge[]> {
    return readFromStorage<Badge[]>(STORAGE_KEYS.BADGES, []);
  },

  /**
   * Save badges to storage
   * Retries once on failure
   * Throws error if quota exceeded or max retries reached
   */
  async saveBadges(badges: Badge[]): Promise<void> {
    return writeToStorage(STORAGE_KEYS.BADGES, badges);
  },

  /**
   * Get health snapshots from storage
   * Returns empty array if read fails
   */
  async getHealthSnapshots(): Promise<HealthSnapshot[]> {
    return readFromStorage<HealthSnapshot[]>(STORAGE_KEYS.HEALTH_SNAPSHOTS, []);
  },

  /**
   * Save health snapshots to storage
   * Retries once on failure
   * Throws error if quota exceeded or max retries reached
   */
  async saveHealthSnapshots(snapshots: HealthSnapshot[]): Promise<void> {
    return writeToStorage(STORAGE_KEYS.HEALTH_SNAPSHOTS, snapshots);
  },

  /**
   * Get chat history from storage
   * Returns empty array if read fails
   */
  async getChatHistory(): Promise<ChatMessage[]> {
    return readFromStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY, []);
  },

  /**
   * Save chat history to storage
   * Retries once on failure
   * Throws error if quota exceeded or max retries reached
   */
  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    return writeToStorage(STORAGE_KEYS.CHAT_HISTORY, messages);
  },

  /**
   * Get cached weather data from storage
   * Returns null if no cache exists or read fails
   */
  async getWeatherCache(): Promise<WeatherData | null> {
    return readFromStorage<WeatherData | null>(STORAGE_KEYS.WEATHER_CACHE, null);
  },

  /**
   * Save weather data to cache
   * Retries once on failure
   * Throws error if quota exceeded or max retries reached
   */
  async saveWeatherCache(data: WeatherData): Promise<void> {
    return writeToStorage(STORAGE_KEYS.WEATHER_CACHE, data);
  },

  /**
   * Clear all cached data from storage
   * Used to free up storage space
   */
  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.WEATHER_CACHE),
        AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY),
      ]);
      console.log('[StorageService] Cache cleared successfully');
    } catch (error) {
      console.error('[StorageService] Failed to clear cache:', error);
      throw new Error('Failed to clear cache');
    }
  },
};

/**
 * Export additional utility functions for testing and advanced usage
 */
export const storageUtils = {
  /**
   * Get all storage keys used by the app
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('[StorageService] Failed to get all keys:', error);
      return [];
    }
  },

  /**
   * Clear all app data (use with caution!)
   */
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
      console.log('[StorageService] All data cleared');
    } catch (error) {
      console.error('[StorageService] Failed to clear all data:', error);
      throw new Error('Failed to clear all data');
    }
  },

  /**
   * Get storage usage information
   */
  getStorageInfo: async (): Promise<{
    keys: string[];
    count: number;
  }> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return {
        keys,
        count: keys.length,
      };
    } catch (error) {
      console.error('[StorageService] Failed to get storage info:', error);
      return { keys: [], count: 0 };
    }
  },
};

export default storageService;
