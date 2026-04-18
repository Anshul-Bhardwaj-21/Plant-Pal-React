/**
 * WeatherService Example Usage
 * 
 * This file demonstrates how to use the WeatherService for fetching
 * current weather and forecasts with caching support.
 */

import { weatherService, weatherUtils } from './weatherService';
import { WeatherData, WeatherForecast } from '../types';

/**
 * Example 1: Check API configuration
 */
export const checkWeatherConfig = () => {
  const status = weatherUtils.getConfigStatus();
  
  if (status.configured) {
    console.log('✓ Weather API is configured');
  } else {
    console.error('✗ Weather API not configured:', status.error);
  }
  
  return status.configured;
};

/**
 * Example 2: Get current weather with caching
 */
export const getCurrentWeatherWithCache = async (
  latitude: number,
  longitude: number
): Promise<WeatherData | null> => {
  try {
    // First, try to get cached weather
    const cachedWeather = await weatherService.getCachedWeather();
    
    if (cachedWeather) {
      console.log('Using cached weather data');
      return cachedWeather;
    }

    // If no valid cache, fetch fresh data
    console.log('Fetching fresh weather data');
    const weather = await weatherService.getCurrentWeather(latitude, longitude);
    
    return weather;
  } catch (error: any) {
    console.error('Failed to get weather:', error.message);
    
    // Handle specific error codes
    switch (error.code) {
      case 'NETWORK_ERROR':
        console.log('No internet - try using cached data');
        break;
      case 'API_UNAUTHORIZED':
        console.log('Check your API key configuration');
        break;
      case 'API_RATE_LIMIT':
        console.log('Rate limit exceeded - wait before retrying');
        break;
      case 'API_TIMEOUT':
        console.log('Request timed out - check your connection');
        break;
      default:
        console.log('Unknown error occurred');
    }
    
    return null;
  }
};

/**
 * Example 3: Get 7-day forecast
 */
export const getWeatherForecast = async (
  latitude: number,
  longitude: number
): Promise<WeatherForecast | null> => {
  try {
    const forecast = await weatherService.getForecast(latitude, longitude);
    
    console.log(`Forecast for next ${forecast.daily.length} days:`);
    forecast.daily.forEach(day => {
      console.log(
        `${day.date}: ${day.tempLow}°C - ${day.tempHigh}°C, ${day.conditions}`
      );
    });
    
    return forecast;
  } catch (error: any) {
    console.error('Failed to get forecast:', error.message);
    return null;
  }
};

/**
 * Example 4: Display weather information
 */
export const displayWeatherInfo = (weather: WeatherData) => {
  console.log('=== Current Weather ===');
  console.log(`Location: ${weather.location}`);
  console.log(`Temperature: ${weather.temperature}°C`);
  console.log(`Humidity: ${weather.humidity}%`);
  console.log(`Wind Speed: ${weather.windSpeed} m/s`);
  console.log(`Conditions: ${weather.conditions}`);
  console.log(`Last Updated: ${new Date(weather.timestamp).toLocaleString()}`);
};

/**
 * Example 5: Complete weather flow with error handling
 */
export const completeWeatherFlow = async (
  latitude: number,
  longitude: number
) => {
  console.log('Starting weather flow...');
  
  // Check configuration
  if (!checkWeatherConfig()) {
    console.error('Weather service not configured. Add WEATHER_API_KEY to .env');
    return;
  }

  // Get current weather
  const weather = await getCurrentWeatherWithCache(latitude, longitude);
  if (weather) {
    displayWeatherInfo(weather);
  }

  // Get forecast
  const forecast = await getWeatherForecast(latitude, longitude);
  if (forecast) {
    console.log(`\nReceived ${forecast.daily.length}-day forecast`);
  }
};

/**
 * Example 6: Handle offline scenario
 */
export const handleOfflineWeather = async () => {
  console.log('Checking for cached weather data...');
  
  const cachedWeather = await weatherService.getCachedWeather();
  
  if (cachedWeather) {
    console.log('Found cached weather data:');
    displayWeatherInfo(cachedWeather);
    
    const cacheAge = Date.now() - new Date(cachedWeather.timestamp).getTime();
    const minutesOld = Math.floor(cacheAge / 60000);
    console.log(`Cache age: ${minutesOld} minutes`);
  } else {
    console.log('No cached weather data available');
  }
};

/**
 * Example 7: Test coordinates (San Francisco)
 */
export const testWeatherService = async () => {
  const testCoordinates = {
    latitude: 37.7749,
    longitude: -122.4194,
  };
  
  console.log('Testing WeatherService with San Francisco coordinates...');
  await completeWeatherFlow(
    testCoordinates.latitude,
    testCoordinates.longitude
  );
};

// Usage examples:
// 
// import { testWeatherService, getCurrentWeatherWithCache } from './weatherService.example';
//
// // Test the service
// testWeatherService();
//
// // Get weather for specific location
// const weather = await getCurrentWeatherWithCache(37.7749, -122.4194);
