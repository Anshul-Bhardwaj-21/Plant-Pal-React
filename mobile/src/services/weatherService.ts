/**
 * WeatherService - OpenWeatherMap API integration with caching
 * 
 * Provides current weather and 7-day forecast data with 30-minute caching
 * to reduce API calls. Implements timeout and comprehensive error handling.
 * 
 * Requirements: 7.5-7.13, 16.4-16.6
 */

import Constants from 'expo-constants';
import {
  WeatherService,
  WeatherData,
  WeatherForecast,
  ApiErrorCode,
} from '../types';
import { storageService } from './storageService';

// Constants
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const REQUEST_TIMEOUT_MS = 15000; // 15 seconds
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Custom error class for Weather API errors
 */
class WeatherApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;

  constructor(message: string, code: ApiErrorCode, statusCode?: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Get API key from environment variables
 */
const getApiKey = (): string => {
  const apiKey = Constants.expoConfig?.extra?.WEATHER_API_KEY || 
                 process.env.WEATHER_API_KEY ||
                 process.env.VITE_WEATHER_API_KEY;
  
  if (!apiKey) {
    throw new WeatherApiError(
      'Weather service not configured - missing API key',
      'API_NOT_CONFIGURED'
    );
  }
  
  return apiKey;
};

/**
 * Create a timeout promise
 */
const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new WeatherApiError(
        'Request timed out - please try again',
        'API_TIMEOUT'
      ));
    }, ms);
  });
};

/**
 * Handle API errors and convert to user-friendly messages
 */
const handleApiError = (error: any, response?: Response): never => {
  console.error('[WeatherService] API error:', error);

  // Check for network errors
  if (error.message?.includes('network') || 
      error.message?.includes('fetch') ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.name === 'TypeError') {
    throw new WeatherApiError(
      'No internet connection - please check your network',
      'NETWORK_ERROR'
    );
  }

  // Check for timeout
  if (error.code === 'API_TIMEOUT') {
    throw error;
  }

  // Check HTTP status codes
  if (response) {
    const status = response.status;

    // 401 - Unauthorized (invalid API key)
    if (status === 401) {
      throw new WeatherApiError(
        'Weather service authentication failed - check API key',
        'API_UNAUTHORIZED',
        401
      );
    }

    // 429 - Rate limit exceeded
    if (status === 429) {
      throw new WeatherApiError(
        'Weather service rate limit exceeded - please try again later',
        'API_RATE_LIMIT',
        429
      );
    }

    // 500+ - Server errors
    if (status >= 500) {
      throw new WeatherApiError(
        'Weather service temporarily unavailable - please try again',
        'API_SERVER_ERROR',
        status
      );
    }
  }

  // Generic error
  throw new WeatherApiError(
    'Weather service error - please try again',
    'UNKNOWN_ERROR'
  );
};

/**
 * Make API request with timeout
 */
const fetchWithTimeout = async (url: string): Promise<Response> => {
  const fetchPromise = fetch(url);
  const response = await Promise.race([
    fetchPromise,
    createTimeout(REQUEST_TIMEOUT_MS),
  ]);
  return response;
};

/**
 * Check if cached weather data is still valid
 */
const isCacheValid = (cachedData: WeatherData | null): boolean => {
  if (!cachedData || !cachedData.timestamp) {
    return false;
  }

  const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();
  return cacheAge < CACHE_DURATION_MS;
};

/**
 * WeatherService implementation
 */
export const weatherService: WeatherService = {
  /**
   * Get current weather for given coordinates
   * Returns temperature in Celsius, humidity, wind speed, and conditions
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<WeatherData> {
    try {
      console.log('[WeatherService] Fetching current weather');

      const apiKey = getApiKey();
      const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      const response = await fetchWithTimeout(url);

      // Check for HTTP errors
      if (!response.ok) {
        handleApiError(new Error(`HTTP ${response.status}`), response);
      }

      const data = await response.json();

      // Parse OpenWeatherMap response
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        conditions: data.weather[0].main,
        icon: data.weather[0].icon,
        location: data.name || 'Unknown',
        timestamp: new Date().toISOString(),
      };

      // Cache the weather data
      await this.cacheWeather(weatherData);

      console.log('[WeatherService] Current weather fetched successfully');
      return weatherData;
    } catch (error) {
      // If it's already a WeatherApiError, rethrow it
      if (error instanceof WeatherApiError) {
        throw error;
      }
      // Otherwise, handle it
      return handleApiError(error);
    }
  },

  /**
   * Get 7-day weather forecast for given coordinates
   * Returns daily forecast with high/low temperatures and conditions
   */
  async getForecast(
    latitude: number,
    longitude: number
  ): Promise<WeatherForecast> {
    try {
      console.log('[WeatherService] Fetching 7-day forecast');

      const apiKey = getApiKey();
      const url = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      const response = await fetchWithTimeout(url);

      // Check for HTTP errors
      if (!response.ok) {
        handleApiError(new Error(`HTTP ${response.status}`), response);
      }

      const data = await response.json();

      // OpenWeatherMap's forecast API returns 3-hour intervals for 5 days
      // We need to group by day and calculate daily high/low
      const dailyData: { [date: string]: any[] } = {};

      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0]; // Extract YYYY-MM-DD
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(item);
      });

      // Convert to daily forecast format (limit to 7 days)
      const daily = Object.entries(dailyData)
        .slice(0, 7)
        .map(([date, items]) => {
          const temps = items.map((item: any) => item.main.temp);
          const humidities = items.map((item: any) => item.main.humidity);
          
          // Get the most common weather condition for the day
          const conditions = items.map((item: any) => item.weather[0].main);
          const mostCommonCondition = conditions.sort(
            (a: string, b: string) =>
              conditions.filter((c: string) => c === b).length -
              conditions.filter((c: string) => c === a).length
          )[0];

          // Get icon from midday forecast (around index 4 = 12:00)
          const middayItem = items[Math.floor(items.length / 2)] || items[0];

          return {
            date,
            tempHigh: Math.round(Math.max(...temps)),
            tempLow: Math.round(Math.min(...temps)),
            conditions: mostCommonCondition,
            icon: middayItem.weather[0].icon,
            humidity: Math.round(
              humidities.reduce((a: number, b: number) => a + b, 0) / humidities.length
            ),
          };
        });

      console.log('[WeatherService] 7-day forecast fetched successfully');
      return { daily };
    } catch (error) {
      // If it's already a WeatherApiError, rethrow it
      if (error instanceof WeatherApiError) {
        throw error;
      }
      // Otherwise, handle it
      return handleApiError(error);
    }
  },

  /**
   * Get cached weather data if available and valid
   * Returns null if cache is expired or doesn't exist
   */
  async getCachedWeather(): Promise<WeatherData | null> {
    try {
      const cachedData = await storageService.getWeatherCache();
      
      if (isCacheValid(cachedData)) {
        console.log('[WeatherService] Using cached weather data');
        return cachedData;
      }

      console.log('[WeatherService] Cache expired or invalid');
      return null;
    } catch (error) {
      console.error('[WeatherService] Failed to get cached weather:', error);
      return null;
    }
  },

  /**
   * Cache weather data for 30 minutes
   * Reduces API calls and provides offline fallback
   */
  async cacheWeather(data: WeatherData): Promise<void> {
    try {
      await storageService.saveWeatherCache(data);
      console.log('[WeatherService] Weather data cached successfully');
    } catch (error) {
      console.error('[WeatherService] Failed to cache weather data:', error);
      // Don't throw error - caching failure shouldn't break the app
    }
  },
};

/**
 * Export utility functions for testing and validation
 */
export const weatherUtils = {
  /**
   * Validate API key configuration
   */
  validateApiKey: (): boolean => {
    try {
      getApiKey();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get API configuration status
   */
  getConfigStatus: (): {
    configured: boolean;
    error?: string;
  } => {
    try {
      getApiKey();
      return { configured: true };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Check if cache is valid (for testing)
   */
  isCacheValid,

  /**
   * Get cache duration in milliseconds (for testing)
   */
  getCacheDuration: (): number => CACHE_DURATION_MS,
};

export default weatherService;
