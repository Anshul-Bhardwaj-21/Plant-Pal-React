// Data Models and TypeScript Interfaces for PlantPal Mobile App

// ============================================================================
// Plant Data Models
// ============================================================================

export interface Plant {
  id: string; // UUID format
  name: string;
  scientificName?: string;
  type: string; // e.g., "Succulent", "Fern", "Flowering"
  image?: string; // File path to local image
  createdAt: string; // ISO 8601 format
  lastWatered?: string; // ISO 8601 format
  wateringFrequency: number; // Days between watering
  sunlight: 'low' | 'medium' | 'high';
  healthScore: number; // 0-100
  careScore: number; // 0-100
  age: number; // Days since creation
  diseaseStatus?: {
    hasDisease: boolean;
    diseaseName?: string;
    detectedAt?: string; // ISO 8601 format
    treated?: boolean;
  };
}

export interface CareAction {
  id: string; // UUID format
  plantId: string;
  type: 'watering' | 'disease_check' | 'fertilizing' | 'pruning' | 'repotting';
  timestamp: string; // ISO 8601 format
  notes?: string;
  metadata?: {
    // For disease_check
    diseaseName?: string;
    confidence?: number;
    symptoms?: string;
    causes?: string;
    treatment?: string;
    isHealthy?: boolean;
    // For other actions
    [key: string]: any;
  };
}

export interface Badge {
  id: string; // UUID format
  type: 'care' | 'streak' | 'health' | 'collection';
  name: string;
  description: string;
  earnedAt: string; // ISO 8601 format
  plantId?: string; // Optional, for plant-specific badges
  icon?: string;
}

export interface HealthSnapshot {
  id: string; // UUID format
  plantId: string;
  healthScore: number; // 0-100
  careScore: number; // 0-100
  timestamp: string; // ISO 8601 format
  date: string; // YYYY-MM-DD format for grouping
}

export interface ChatMessage {
  id: string; // UUID format
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601 format
}

// ============================================================================
// Service Interfaces
// ============================================================================

export interface GeminiService {
  identifyPlant(imageUri: string): Promise<PlantIdentificationResult>;
  detectDisease(imageUri: string): Promise<DiseaseDetectionResult>;
  chat(message: string, context: ChatContext): Promise<string>;
}

export interface PlantIdentificationResult {
  predictions: Array<{
    scientificName: string;
    commonName: string;
    type: string;
    confidence: number; // 0-1
    careRequirements?: {
      wateringFrequency: number;
      sunlight: 'low' | 'medium' | 'high';
      notes?: string;
    };
  }>;
}

export interface DiseaseDetectionResult {
  isHealthy: boolean;
  disease?: {
    name: string;
    confidence: number; // 0-1
    symptoms: string;
    causes: string;
    treatment: string;
  };
}

export interface ChatContext {
  plants: Plant[];
  weather?: WeatherData;
  conversationHistory: ChatMessage[];
}

export interface WeatherService {
  getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData>;
  getForecast(latitude: number, longitude: number): Promise<WeatherForecast>;
  getCachedWeather(): Promise<WeatherData | null>;
  cacheWeather(data: WeatherData): Promise<void>;
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  windSpeed: number; // m/s
  conditions: string; // e.g., "Clear", "Cloudy", "Rainy"
  icon: string; // Weather icon code
  location: string;
  timestamp: string; // ISO 8601 format
}

export interface WeatherForecast {
  daily: Array<{
    date: string; // YYYY-MM-DD
    tempHigh: number;
    tempLow: number;
    conditions: string;
    icon: string;
    humidity: number;
  }>;
}

export interface StorageService {
  getPlants(): Promise<Plant[]>;
  savePlants(plants: Plant[]): Promise<void>;
  getCareHistory(): Promise<CareAction[]>;
  saveCareHistory(history: CareAction[]): Promise<void>;
  getBadges(): Promise<Badge[]>;
  saveBadges(badges: Badge[]): Promise<void>;
  getHealthSnapshots(): Promise<HealthSnapshot[]>;
  saveHealthSnapshots(snapshots: HealthSnapshot[]): Promise<void>;
  getChatHistory(): Promise<ChatMessage[]>;
  saveChatHistory(messages: ChatMessage[]): Promise<void>;
  getWeatherCache(): Promise<WeatherData | null>;
  saveWeatherCache(data: WeatherData): Promise<void>;
  clearCache(): Promise<void>;
}

export interface PermissionService {
  requestCameraPermission(): Promise<PermissionStatus>;
  checkCameraPermission(): Promise<PermissionStatus>;
  requestLocationPermission(): Promise<PermissionStatus>;
  checkLocationPermission(): Promise<PermissionStatus>;
  openSettings(): Promise<void>;
}

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface ImageService {
  saveImage(uri: string, plantId: string): Promise<string>;
  deleteImage(filePath: string): Promise<void>;
  processImage(uri: string): Promise<string>;
  selectFromGallery(): Promise<string | null>;
}

// ============================================================================
// Constants
// ============================================================================

export const STORAGE_KEYS = {
  PLANTS: 'plants',
  CARE_HISTORY: 'care_history',
  BADGES: 'badges',
  HEALTH_SNAPSHOTS: 'health_snapshots',
  CHAT_HISTORY: 'chat_history',
  WEATHER_CACHE: 'weather_cache',
} as const;

export const BADGE_DEFINITIONS = {
  HEALTH_MONITOR: {
    id: 'health_monitor',
    type: 'care' as const,
    name: 'Health Monitor',
    description: 'Performed 10 disease checks',
    icon: '🔍',
    requirement: {
      type: 'disease_check_count',
      count: 10,
    },
  },
  YEAR_KEEPER: {
    id: 'year_keeper',
    type: 'care' as const,
    name: 'Year Keeper',
    description: 'Kept a plant alive for 365 days',
    icon: '🎂',
    requirement: {
      type: 'plant_age',
      days: 365,
    },
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    type: 'streak' as const,
    name: 'Week Warrior',
    description: 'Watered a plant for 7 consecutive days',
    icon: '💧',
    requirement: {
      type: 'watering_streak',
      days: 7,
    },
  },
  MONTHLY_MASTER: {
    id: 'monthly_master',
    type: 'streak' as const,
    name: 'Monthly Master',
    description: 'Watered a plant for 30 consecutive days',
    icon: '🌊',
    requirement: {
      type: 'watering_streak',
      days: 30,
    },
  },
  PERFECT_HEALTH: {
    id: 'perfect_health',
    type: 'health' as const,
    name: 'Perfect Health',
    description: 'Maintained 90+ health score for 7 days',
    icon: '💚',
    requirement: {
      type: 'health_score_streak',
      score: 90,
      days: 7,
    },
  },
  PLANT_COLLECTOR: {
    id: 'plant_collector',
    type: 'collection' as const,
    name: 'Plant Collector',
    description: 'Own 5 plants',
    icon: '🌱',
    requirement: {
      type: 'plant_count',
      count: 5,
    },
  },
  GREEN_THUMB: {
    id: 'green_thumb',
    type: 'collection' as const,
    name: 'Green Thumb',
    description: 'Own 10 plants',
    icon: '👍',
    requirement: {
      type: 'plant_count',
      count: 10,
    },
  },
} as const;

// ============================================================================
// Utility Types
// ============================================================================

export type BadgeType = Badge['type'];
export type CareActionType = CareAction['type'];
export type SunlightLevel = Plant['sunlight'];

// Error types for better error handling
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export type ApiErrorCode = 
  | 'NETWORK_ERROR'
  | 'API_UNAUTHORIZED'
  | 'API_RATE_LIMIT'
  | 'API_SERVER_ERROR'
  | 'API_TIMEOUT'
  | 'API_NOT_CONFIGURED'
  | 'STORAGE_ERROR'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN_ERROR';
