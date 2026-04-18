/**
 * StorageService Usage Examples
 * 
 * This file demonstrates how to use the StorageService in your app.
 * These examples can be used as reference when implementing features.
 */

import { storageService } from './storageService';
import { Plant, CareAction, Badge } from '../types';

/**
 * Example 1: Saving and retrieving plants
 */
export async function exampleSaveAndGetPlants() {
  // Create a sample plant
  const newPlant: Plant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'My Succulent',
    type: 'Succulent',
    createdAt: new Date().toISOString(),
    wateringFrequency: 7,
    sunlight: 'high',
    healthScore: 100,
    careScore: 0,
    age: 0,
  };

  try {
    // Get existing plants
    const plants = await storageService.getPlants();
    
    // Add new plant
    plants.push(newPlant);
    
    // Save updated plants array
    await storageService.savePlants(plants);
    
    console.log('Plant saved successfully!');
    
    // Retrieve plants to verify
    const updatedPlants = await storageService.getPlants();
    console.log('Total plants:', updatedPlants.length);
  } catch (error) {
    console.error('Error saving plant:', error);
    // Handle error (show toast notification, etc.)
  }
}

/**
 * Example 2: Logging a care action
 */
export async function exampleLogCareAction(plantId: string) {
  const careAction: CareAction = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    plantId,
    type: 'watering',
    timestamp: new Date().toISOString(),
    notes: 'Regular watering',
  };

  try {
    // Get existing care history
    const history = await storageService.getCareHistory();
    
    // Add new action
    history.push(careAction);
    
    // Limit to 500 entries per requirement 11.10
    if (history.length > 500) {
      history.shift(); // Remove oldest entry
    }
    
    // Save updated history
    await storageService.saveCareHistory(history);
    
    console.log('Care action logged successfully!');
  } catch (error) {
    console.error('Error logging care action:', error);
  }
}

/**
 * Example 3: Awarding a badge
 */
export async function exampleAwardBadge(plantId: string) {
  const badge: Badge = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    type: 'streak',
    name: 'Week Warrior',
    description: 'Watered a plant for 7 consecutive days',
    earnedAt: new Date().toISOString(),
    plantId,
    icon: '💧',
  };

  try {
    const badges = await storageService.getBadges();
    
    // Check if badge already earned
    const alreadyEarned = badges.some(b => b.name === badge.name && b.plantId === plantId);
    
    if (!alreadyEarned) {
      badges.push(badge);
      await storageService.saveBadges(badges);
      console.log('Badge awarded!');
      // Show congratulatory notification
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
}

/**
 * Example 4: Handling storage quota errors
 */
export async function exampleHandleQuotaError() {
  try {
    const plants = await storageService.getPlants();
    await storageService.savePlants(plants);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Storage full')) {
      // Show user-friendly message
      console.error('Storage is full. Please delete old plants or care history.');
      // Offer to clear cache
      const shouldClearCache = true; // In real app, ask user
      if (shouldClearCache) {
        await storageService.clearCache();
        console.log('Cache cleared. Please try again.');
      }
    } else {
      console.error('Failed to save data:', error);
    }
  }
}

/**
 * Example 5: Caching weather data
 */
export async function exampleCacheWeather() {
  const weatherData = {
    temperature: 22,
    humidity: 65,
    windSpeed: 5.2,
    conditions: 'Partly Cloudy',
    icon: '02d',
    location: 'San Francisco',
    timestamp: new Date().toISOString(),
  };

  try {
    // Save weather to cache
    await storageService.saveWeatherCache(weatherData);
    
    // Later, retrieve cached weather
    const cachedWeather = await storageService.getWeatherCache();
    
    if (cachedWeather) {
      // Check if cache is still valid (30 minutes per requirement 7.9)
      const cacheAge = Date.now() - new Date(cachedWeather.timestamp).getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (cacheAge < thirtyMinutes) {
        console.log('Using cached weather data');
        return cachedWeather;
      } else {
        console.log('Cache expired, fetching new data');
      }
    }
  } catch (error) {
    console.error('Error with weather cache:', error);
  }
}

/**
 * Example 6: Clearing cache to free up space
 */
export async function exampleClearCache() {
  try {
    await storageService.clearCache();
    console.log('Cache cleared successfully');
    // Show success message to user
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}
